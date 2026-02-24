import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_equipment_i18n_m' })
export class EquipmentI18nEntity {
  @PrimaryColumn('uuid', { name: 'equipment_i18n_id' })
  equipmentI18nId!: string;

  @Column({ name: 'equipment_id', type: 'uuid' })
  equipmentId!: string;

  @Column({ name: 'equipment_name', type: 'text', nullable: true })
  equipmentName?: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'instruction', type: 'text', nullable: true })
  instruction?: string | null;

  @Column({ name: 'locale', type: 'text', nullable: true })
  locale?: string | null;
}
