import { NotExistsError } from '@/common/errors/domain-error';

export class EquipmentsNotFoundError extends NotExistsError {
  constructor() {
    super('Equipments not found.', 'EQUIPMENTS_NOT_FOUND');
    this.name = 'EquipmentsNotFoundError';
  }
}

export class EquipmentPresetsNotFoundError extends NotExistsError {
  constructor() {
    super('Equipment presets not found.', 'EQUIPMENT_PRESETS_NOT_FOUND');
    this.name = 'EquipmentPresetsNotFoundError';
  }
}
