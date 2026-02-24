import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_equipment_m' })
export class EquipmentEntity {
  @PrimaryColumn('uuid', { name: 'equipment_id' })
  equipmentId!: string;

  @Column({ name: 'equipment_type', type: 'text', nullable: true })
  equipmentType?: string | null;

  @Column({ name: 'equipment_code', type: 'text', nullable: true })
  equipmentCode?: string | null;
}
