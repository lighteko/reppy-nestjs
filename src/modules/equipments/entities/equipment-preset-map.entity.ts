import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_equipment_preset_map' })
export class EquipmentPresetMapEntity {
  @PrimaryColumn('uuid', { name: 'preset_id' })
  presetId!: string;

  @PrimaryColumn('uuid', { name: 'equipment_id' })
  equipmentId!: string;
}
