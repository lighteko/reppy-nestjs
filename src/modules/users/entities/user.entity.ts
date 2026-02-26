import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_user_l' })
export class UserEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ name: 'username', type: 'text' })
  username!: string;

  @Column({ name: 'email', type: 'text' })
  email!: string;

  @Column({ name: 'password', type: 'text', nullable: true })
  password?: string | null;

  @Column({ name: 'provider', type: 'text', nullable: true })
  provider?: string | null;

  @Column({ name: 'sub', type: 'text', nullable: true })
  sub?: string | null;

  @Column({ name: 'is_onboarded', type: 'boolean', nullable: true })
  isOnboarded?: boolean | null;
}
