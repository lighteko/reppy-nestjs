import { Injectable } from '@nestjs/common';
import { ChatsRepository } from '@/modules/chats/repository';
import { CreateChatDto, GetChatsWithCursorDto } from '@/modules/chats/dto';
import { ChatNotFoundError } from '@/modules/chats/errors';

@Injectable()
export class ChatsUseCase {
  constructor(private readonly repo: ChatsRepository) {}

  async createChat(input: CreateChatDto): Promise<void> {
    await this.repo.createChat(input);
  }

  async getChatById(msgId: string) {
    const chat = await this.repo.getChatById(msgId);
    if (!chat) {
      throw new ChatNotFoundError();
    }
    return chat;
  }

  async getChatsWithCursor(input: GetChatsWithCursorDto) {
    return this.repo.getChatsWithCursor(input);
  }

  async get50Chats(userId: string) {
    return this.repo.get50Chats(userId);
  }

  async deleteChat(msgId: string): Promise<void> {
    const exists = await this.repo.chatExists(msgId);
    if (!exists) {
      throw new ChatNotFoundError();
    }
    await this.repo.deleteChat(msgId);
  }
}
