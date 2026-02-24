import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_user_pref_l' })
export class UserPrefEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ name: 'unit_system', type: 'text', nullable: true })
  unitSystem?: string | null;

  @Column({ name: 'notif_reminder', type: 'boolean', nullable: true })
  notifReminder?: boolean | null;

  @Column({ name: 'locale', type: 'text', nullable: true })
  locale?: string | null;
}
