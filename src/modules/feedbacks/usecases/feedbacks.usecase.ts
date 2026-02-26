import { Injectable } from '@nestjs/common';
import { FeedbacksRepository } from '@/modules/feedbacks/repository';
import { CreateFeedbackDto } from '@/modules/feedbacks/dto';
import { FeedbackUserNotFoundError } from '@/modules/feedbacks/errors';

@Injectable()
export class FeedbacksUseCase {
  constructor(private readonly repo: FeedbacksRepository) {}

  async createFeedback(input: CreateFeedbackDto): Promise<void> {
    const exists = await this.repo.userExists(input.userId);
    if (!exists) {
      throw new FeedbackUserNotFoundError();
    }
    await this.repo.createFeedback(input);
  }
}
