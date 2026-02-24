import { Module } from '@nestjs/common';
import { FeedbacksController } from '@/modules/feedbacks/presentation/feedbacks.controller';
import { FeedbacksUseCase } from '@/modules/feedbacks/application/feedbacks.usecase';
import { FeedbacksRepository } from '@/modules/feedbacks/infrastructure/feedbacks.repository';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksUseCase, FeedbacksRepository],
})
export class FeedbacksModule {}
