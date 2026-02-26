import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_user_equipment_map' })
export class UserEquipmentMapEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @PrimaryColumn('uuid', { name: 'equipment_id' })
  equipmentId!: string;
}
