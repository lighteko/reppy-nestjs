import { Module } from '@nestjs/common';
import { ChatsController } from '@/modules/chats/controller';
import { ChatsUseCase } from '@/modules/chats/usecases';
import { ChatsRepository } from '@/modules/chats/repository';

@Module({
  controllers: [ChatsController],
  providers: [ChatsUseCase, ChatsRepository],
})
export class ChatsModule {}
