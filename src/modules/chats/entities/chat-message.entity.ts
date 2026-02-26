import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_chat_message_l' })
export class ChatMessageEntity {
  @PrimaryColumn('uuid', { name: 'message_id' })
  messageId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'sender_type', type: 'text' })
  senderType!: string;

  @Column({ name: 'content', type: 'text' })
  content!: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt?: Date | null;
}
