import { Module } from '@nestjs/common';
import { FeedbacksController } from '@/modules/feedbacks/controller';
import { FeedbacksUseCase } from '@/modules/feedbacks/usecases';
import { FeedbacksRepository } from '@/modules/feedbacks/repository';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksUseCase, FeedbacksRepository],
})
export class FeedbacksModule {}
