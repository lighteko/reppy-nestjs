import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_equipment_preset_m' })
export class EquipmentPresetEntity {
  @PrimaryColumn('uuid', { name: 'preset_id' })
  presetId!: string;

  @Column({ name: 'preset_code', type: 'text', nullable: true })
  presetCode?: string | null;
}
