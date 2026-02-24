import { NotExistsError } from '@/common/errors/domain-error';

export class ExercisePlanNotFoundError extends NotExistsError {
  constructor() {
    super('Exercise plan not found.', 'EXERCISE_PLAN_NOT_FOUND');
    this.name = 'ExercisePlanNotFoundError';
  }
}

export class ExerciseSetNotFoundError extends NotExistsError {
  constructor() {
    super('Exercise set not found.', 'EXERCISE_SET_NOT_FOUND');
    this.name = 'ExerciseSetNotFoundError';
  }
}
