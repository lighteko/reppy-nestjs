import { Module } from '@nestjs/common';
import { UsersController } from '@/modules/users/controller';
import { UsersUseCase } from '@/modules/users/usecases';
import { UsersRepository } from '@/modules/users/repository';

@Module({
  controllers: [UsersController],
  providers: [UsersUseCase, UsersRepository],
})
export class UsersModule {}
