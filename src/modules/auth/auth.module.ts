import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/controller';
import { AuthUseCase } from '@/modules/auth/usecases';
import { AuthRepository } from '@/modules/auth/repository';

@Module({
  controllers: [AuthController],
  providers: [AuthUseCase, AuthRepository],
})
export class AuthModule {}
