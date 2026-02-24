import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_user_equipments_map' })
export class UserEquipmentsMapEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @PrimaryColumn('uuid', { name: 'equipment_id' })
  equipmentId!: string;
}
