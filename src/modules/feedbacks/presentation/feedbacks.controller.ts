import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FeedbacksUseCase } from '@/modules/feedbacks/application/feedbacks.usecase';
import { CreateFeedbackDto } from '@/modules/feedbacks/domain/dto/feedbacks.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('feedbacks')
@UseGuards(AuthGuard)
export class FeedbacksController {
  constructor(private readonly usecase: FeedbacksUseCase) {}

  @Post()
  async create(@Body() body: CreateFeedbackDto) {
    await this.usecase.createFeedback(body);
    return { data: { message: 'Feedback created successfully' } };
  }
}
