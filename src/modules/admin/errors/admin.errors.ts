import { NotExistsError } from '@/common/errors/domain-error';

export class EquipmentNotFoundError extends NotExistsError {
  constructor() {
    super('Equipment not found.', 'EQUIPMENT_NOT_FOUND');
    this.name = 'EquipmentNotFoundError';
  }
}

export class MuscleNotFoundError extends NotExistsError {
  constructor() {
    super('Muscle not found.', 'MUSCLE_NOT_FOUND');
    this.name = 'MuscleNotFoundError';
  }
}
