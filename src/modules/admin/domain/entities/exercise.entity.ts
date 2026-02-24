import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_exercise_m' })
export class ExerciseEntity {
  @PrimaryColumn('uuid', { name: 'exercise_id' })
  exerciseId!: string;

  @Column({ name: 'equipment_id', type: 'uuid' })
  equipmentId!: string;

  @Column({ name: 'main_muscle_id', type: 'uuid' })
  mainMuscleId!: string;

  @Column({ name: 'aux_muscle_id', type: 'uuid', nullable: true })
  auxMuscleId?: string | null;

  @Column({ name: 'difficulty_level', type: 'int' })
  difficultyLevel!: number;
}

@Entity({ name: 'repy_exercise_i18n_m' })
export class ExerciseI18nEntity {
  @PrimaryColumn('uuid', { name: 'exercise_i18n_id' })
  exerciseI18nId!: string;

  @Column({ name: 'exercise_id', type: 'uuid' })
  exerciseId!: string;

  @Column({ name: 'exercise_name', type: 'text' })
  exerciseName!: string;

  @Column({ name: 'instruction', type: 'text' })
  instruction!: string;

  @Column({ name: 'locale', type: 'text' })
  locale!: string;
}
