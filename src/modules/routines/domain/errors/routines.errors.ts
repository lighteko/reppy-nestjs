import { NotExistsError } from '@/common/errors/domain-error';

export class ProgramNotFoundError extends NotExistsError {
  constructor() {
    super('Program not found.', 'PROGRAM_NOT_FOUND');
    this.name = 'ProgramNotFoundError';
  }
}
