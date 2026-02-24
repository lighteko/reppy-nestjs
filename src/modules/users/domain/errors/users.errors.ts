import { NotExistsError } from '@/common/errors/domain-error';

export class UserNotFoundError extends NotExistsError {
  constructor() {
    super('User not found.', 'USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}
