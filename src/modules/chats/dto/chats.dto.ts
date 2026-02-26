import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SenderType {
  USER = 'USER',
  REPPY = 'REPPY',
}

export class CreateChatDto {
  @IsUUID('4')
  userId!: string;

  @IsEnum(SenderType)
  senderType!: SenderType;

  @IsString()
  content!: string;
}

export class GetChatsWithCursorDto {
  @IsUUID('4')
  userId!: string;

  @IsString()
  createdAt!: string;
}

export class ChatResponseDto {
  @IsUUID('4')
  messageId!: string;

  @IsUUID('4')
  userId!: string;

  @IsEnum(SenderType)
  senderType!: SenderType;

  @IsString()
  content!: string;

  @IsString()
  createdAt!: string;
}

export class MultipleChatResponseDto {
  @IsOptional()
  chats?: ChatResponseDto[];
}
