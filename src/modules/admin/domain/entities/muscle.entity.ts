import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_muscle_m' })
export class MuscleEntity {
  @PrimaryColumn('uuid', { name: 'muscle_id' })
  muscleId!: string;
}

@Entity({ name: 'repy_muscle_i18n_m' })
export class MuscleI18nEntity {
  @PrimaryColumn('uuid', { name: 'muscle_i18n_id' })
  muscleI18nId!: string;

  @Column({ name: 'muscle_id', type: 'uuid' })
  muscleId!: string;

  @Column({ name: 'muscle_name', type: 'text' })
  muscleName!: string;

  @Column({ name: 'locale', type: 'text' })
  locale!: string;
}
