import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
  CreateChatDto,
  GetChatsWithCursorDto,
} from '@/modules/chats/domain/dto/chats.dto';

@Injectable()
export class ChatsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async chatExists(messageId: string): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
            SELECT 1
            FROM repy_chat_message_l
            WHERE message_id = $1;
            `,
      [messageId],
    );
    return rows.length > 0;
  }

  async createChat(input: CreateChatDto): Promise<void> {
    const messageId = uuid4();
    await this.dataSource.query(
      `
            INSERT INTO repy_chat_message_l
                (message_id, user_id, sender_type, content)
            VALUES ($1, $2, $3, $4);
            `,
      [messageId, input.userId, input.senderType, input.content],
    );
  }

  async getChatById(messageId: string) {
    const rows = await this.dataSource.query(
      `
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE message_id = $1;
            `,
      [messageId],
    );
    return rows[0] ?? null;
  }

  async getChatsWithCursor(input: GetChatsWithCursorDto) {
    return this.dataSource.query(
      `
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE user_id = $1
            AND created_at < $2
            ORDER BY created_at DESC
            LIMIT 50;
            `,
      [input.userId, input.createdAt],
    );
  }

  async get50Chats(userId: string) {
    return this.dataSource.query(
      `
            SELECT
                message_id as "messageId",
                user_id as "userId",
                sender_type as "senderType",
                content as "content",
                created_at as "createdAt"
            FROM repy_chat_message_l
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50;
            `,
      [userId],
    );
  }

  async deleteChat(messageId: string): Promise<void> {
    await this.dataSource.query(
      `
            DELETE
            FROM repy_chat_message_l
            WHERE message_id = $1;
            `,
      [messageId],
    );
  }
}
