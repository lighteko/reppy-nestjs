import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: any;
}

@Injectable()
export class TokensService {
  private readonly accessSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiry: string;
  private readonly emailSecret: string;

  constructor(private readonly config: ConfigService) {
    this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET') ?? '';
    this.accessExpiry = this.config.get<string>('JWT_ACCESS_EXPIRY') ?? '';
    this.refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') ?? '';
    this.refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '';
    this.emailSecret = this.config.get<string>('EMAIL_TOKEN_SECRET') ?? '';
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload as object, this.accessSecret, {
      expiresIn: this.accessExpiry,
    } as SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessSecret) as TokenPayload;
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload as object, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    } as SignOptions);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.refreshSecret) as TokenPayload;
  }

  generateEmailToken(): string {
    return jwt.sign({}, this.emailSecret, { expiresIn: '15m' });
  }
}
