import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_user_bio_l' })
export class UserBioEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ name: 'height', type: 'float', nullable: true })
  height?: number | null;

  @Column({ name: 'sex', type: 'text', nullable: true })
  sex?: string | null;

  @Column({ name: 'body_weight', type: 'float', nullable: true })
  bodyWeight?: number | null;

  @Column({ name: 'birthdate', type: 'date', nullable: true })
  birthdate?: string | null;
}
