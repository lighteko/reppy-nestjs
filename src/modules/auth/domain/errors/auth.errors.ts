import {
  DuplicateError,
  NotExistsError,
  UnauthorizedDomainError,
} from '@/common/errors/domain-error';

export class DuplicateUserError extends DuplicateError {
  constructor() {
    super('User already exists.', 'DUPLICATE_USER');
    this.name = 'DuplicateUserError';
  }
}

export class InvalidCredentialsError extends UnauthorizedDomainError {
  constructor() {
    super('Invalid Credentials.', 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidRefreshTokenError extends UnauthorizedDomainError {
  constructor() {
    super('Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
    this.name = 'InvalidRefreshTokenError';
  }
}

export class AuthUserNotFoundError extends NotExistsError {
  constructor() {
    super('User not found.', 'AUTH_USER_NOT_FOUND');
    this.name = 'AuthUserNotFoundError';
  }
}
