import { NotExistsError } from '@/common/errors/domain-error';

export class ChatNotFoundError extends NotExistsError {
  constructor() {
    super('Chat not found.', 'CHAT_NOT_FOUND');
    this.name = 'ChatNotFoundError';
  }
}
