import { NotExistsError } from '@/common/errors/domain-error';

export class FeedbackUserNotFoundError extends NotExistsError {
  constructor() {
    super('User not found.', 'FEEDBACK_USER_NOT_FOUND');
    this.name = 'FeedbackUserNotFoundError';
  }
}
