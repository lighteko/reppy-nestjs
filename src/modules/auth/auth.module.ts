import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/presentation/auth.controller';
import { AuthUseCase } from '@/modules/auth/application/auth.usecase';
import { AuthRepository } from '@/modules/auth/infrastructure/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthUseCase, AuthRepository],
})
export class AuthModule {}
