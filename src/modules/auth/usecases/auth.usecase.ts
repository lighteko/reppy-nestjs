import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { AuthRepository } from '@/modules/auth/repository';
import {
  LoginPayloadDto,
  SignUpWithOAuthDto,
  SignUpWithPasswordDto,
} from '@/modules/auth/dto';
import { TokensService } from '@/common/auth/tokens.service';
import {
  AuthUserNotFoundError,
  DuplicateUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '@/modules/auth/errors';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly tokens: TokensService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async signUpWithPassword(input: SignUpWithPasswordDto) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.repo.getUserInfoByEmail(input.email, manager);
      if (existing) {
        throw new DuplicateUserError();
      }
      const hashed = await bcrypt.hash(input.password, 12);
      await this.repo.createUserWithPassword(
        { ...input, password: hashed },
        manager,
      );
      const user = await this.repo.getUserInfoByEmail(input.email, manager);
      if (!user) {
        throw new AuthUserNotFoundError();
      }
      const accessToken = this.tokens.generateAccessToken({
        userId: user.userId,
        email: input.email,
      });
      const refreshToken = this.tokens.generateRefreshToken({
        userId: user.userId,
        email: input.email,
      });
      return { user, accessToken, refreshToken };
    });
  }

  async signUpWithOAuth(input: SignUpWithOAuthDto) {
    await this.dataSource.transaction(async (manager) => {
      const existing = await this.repo.getUserInfoByEmail(input.email, manager);
      if (existing) {
        throw new DuplicateUserError();
      }
      await this.repo.createUserWithOAuth(input, manager);
    });
  }

  async login(input: LoginPayloadDto) {
    const user = await this.repo.getUserInfoByEmail(input.email);
    if (!user || !user.password) {
      throw new InvalidCredentialsError();
    }
    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) {
      throw new InvalidCredentialsError();
    }
    const accessToken = this.tokens.generateAccessToken({
      userId: user.userId,
      email: input.email,
    });
    const refreshToken = this.tokens.generateRefreshToken({
      userId: user.userId,
      email: input.email,
    });
    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: { userId: string; email: string };
    try {
      payload = this.tokens.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }
    const user = await this.repo.getUserInfoByEmail(payload.email);
    if (!user) {
      throw new AuthUserNotFoundError();
    }
    const accessToken = this.tokens.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });
    const newRefreshToken = this.tokens.generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });
    return { user, accessToken, refreshToken: newRefreshToken };
  }
}
