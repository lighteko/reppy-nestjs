import { NotExistsError } from '@/common/errors/domain-error';

export class OnboardingUserNotFoundError extends NotExistsError {
  constructor() {
    super('User not found.', 'ONBOARDING_USER_NOT_FOUND');
    this.name = 'OnboardingUserNotFoundError';
  }
}

export class PresetNotFoundError extends NotExistsError {
  constructor() {
    super('Equipment preset not found.', 'PRESET_NOT_FOUND');
    this.name = 'PresetNotFoundError';
  }
}
