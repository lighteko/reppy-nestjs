import { Module } from '@nestjs/common';
import { ChatsController } from '@/modules/chats/presentation/chats.controller';
import { ChatsUseCase } from '@/modules/chats/application/chats.usecase';
import { ChatsRepository } from '@/modules/chats/infrastructure/chats.repository';

@Module({
  controllers: [ChatsController],
  providers: [ChatsUseCase, ChatsRepository],
})
export class ChatsModule {}
