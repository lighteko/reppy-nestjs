import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthUseCase } from '@/modules/auth/application/auth.usecase';
import {
  RefreshTokenDto,
  SignUpWithOAuthDto,
  SignUpWithPasswordDto,
} from '@/modules/auth/domain/dto/auth.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly usecase: AuthUseCase) {}

  @Post('signup')
  async signup(@Body() body: SignUpWithPasswordDto) {
    const result = await this.usecase.signUpWithPassword(body);
    return {
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Post('signup/oauth')
  async signupOAuth(@Body() body: SignUpWithOAuthDto) {
    await this.usecase.signUpWithOAuth(body);
    return { data: { message: 'User created successfully.' } };
  }

  @Post('login')
  async login(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (authHeader.split(' ')[0] !== 'Basic') {
      throw new BadRequestException('Invalid Basic Token');
    }
    const payload = parseBasicToken(authHeader.split(' ')[1]);
    const result = await this.usecase.login(payload);
    return {
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const result = await this.usecase.refresh(body.refreshToken);
    return {
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout() {
    return { data: { message: 'Log out succeeded' } };
  }
}

function parseBasicToken(basicToken: string): {
  email: string;
  password: string;
} {
  const decoded = Buffer.from(basicToken, 'base64').toString('utf-8');
  const delimiterPos = decoded.indexOf(':');
  if (delimiterPos === -1) {
    throw new BadRequestException('Invalid credential format');
  }
  const email = decoded.substring(0, delimiterPos);
  const password = decoded.substring(delimiterPos + 1);
  if (!email || !password) {
    throw new UnauthorizedException('Invalid credentials');
  }
  return { email, password };
}
