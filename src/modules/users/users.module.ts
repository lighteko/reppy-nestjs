import { Module } from '@nestjs/common';
import { UsersController } from '@/modules/users/presentation/users.controller';
import { UsersUseCase } from '@/modules/users/application/users.usecase';
import { UsersRepository } from '@/modules/users/infrastructure/users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersUseCase, UsersRepository],
})
export class UsersModule {}
