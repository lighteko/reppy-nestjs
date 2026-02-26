import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminPassword: string;

  constructor(config: ConfigService) {
    this.adminPassword = config.get<string>('ADMIN_PASSWORD') ?? '';
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const adminHeader = req.headers?.admin as string | undefined;
    if (!adminHeader || adminHeader !== this.adminPassword) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
