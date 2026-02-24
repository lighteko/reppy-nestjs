import { Injectable } from '@nestjs/common';
import { EquipmentsRepository } from '@/modules/equipments/infrastructure/equipments.repository';
import {
  GetEquipmentPresetsDto,
  GetFilteredEquipmentsDto,
} from '@/modules/equipments/domain/dto/equipments.dto';

@Injectable()
export class EquipmentsUseCase {
  constructor(private readonly repo: EquipmentsRepository) {}

  async getFilteredEquipments(input: GetFilteredEquipmentsDto) {
    return this.repo.getFilteredEquipments(input);
  }

  async getEquipmentPresets(input: GetEquipmentPresetsDto) {
    return this.repo.getEquipmentPresets(input);
  }
}
