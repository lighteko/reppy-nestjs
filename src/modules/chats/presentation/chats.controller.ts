import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChatsUseCase } from '@/modules/chats/application/chats.usecase';
import { CreateChatDto } from '@/modules/chats/domain/dto/chats.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly usecase: ChatsUseCase) {}

  @Post()
  async create(@Body() body: CreateChatDto) {
    await this.usecase.createChat(body);
    return { data: { message: 'Chat created successfully.' } };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    if (!id)
      throw new BadRequestException("Missing required parameter 'msgId'");
    const chat = await this.usecase.getChatById(id);
    return { data: { chat } };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!id)
      throw new BadRequestException("Missing required parameter 'msgId'");
    await this.usecase.deleteChat(id);
    return { data: { message: 'Chat deleted successfully.' } };
  }

  @Get('cursor/:id')
  async getWithCursor(
    @Param('id') userId: string,
    @Query('createdAt') createdAt?: string,
  ) {
    if (createdAt) {
      const chats = await this.usecase.getChatsWithCursor({
        userId,
        createdAt,
      });
      return { data: { chats } };
    }
    if (!userId)
      throw new BadRequestException("Missing required parameter 'userId'");
    const chats = await this.usecase.get50Chats(userId);
    return { data: { chats } };
  }
}
