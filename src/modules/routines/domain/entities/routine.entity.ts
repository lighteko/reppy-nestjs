import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_routine_l' })
export class RoutineEntity {
  @PrimaryColumn('uuid', { name: 'routine_id' })
  routineId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'routine_name', type: 'text' })
  routineName!: string;

  @Column({ name: 'routine_order', type: 'int', nullable: true })
  routineOrder?: number | null;
}

@Entity({ name: 'repy_program_l' })
export class ProgramEntity {
  @PrimaryColumn('uuid', { name: 'program_id' })
  programId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'program_name', type: 'text', nullable: true })
  programName?: string | null;

  @Column({ name: 'experience', type: 'text', nullable: true })
  experience?: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ name: 'goal_date', type: 'date', nullable: true })
  goalDate?: string | null;

  @Column({ name: 'goal', type: 'text', nullable: true })
  goal?: string | null;
}

@Entity({ name: 'repy_program_routine_map' })
export class ProgramRoutineMapEntity {
  @PrimaryColumn('uuid', { name: 'program_id' })
  programId!: string;

  @PrimaryColumn('uuid', { name: 'routine_id' })
  routineId!: string;
}

@Entity({ name: 'repy_routine_version_l' })
export class RoutineVersionEntity {
  @PrimaryColumn('uuid', { name: 'routine_version_id' })
  routineVersionId!: string;

  @Column({ name: 'routine_id', type: 'uuid' })
  routineId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive!: boolean;
}

@Entity({ name: 'repy_exercise_plan_l' })
export class ExercisePlanEntity {
  @PrimaryColumn('uuid', { name: 'plan_id' })
  planId!: string;

  @Column({ name: 'routine_version_id', type: 'uuid', nullable: true })
  routineVersionId?: string | null;

  @Column({ name: 'exercise_id', type: 'uuid' })
  exerciseId!: string;

  @Column({ name: 'exec_order', type: 'int', nullable: true })
  execOrder?: number | null;

  @Column({ name: 'memo', type: 'text', nullable: true })
  memo?: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;
}

@Entity({ name: 'repy_exercise_set_l' })
export class ExerciseSetEntity {
  @PrimaryColumn('uuid', { name: 'set_id' })
  setId!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
  exerciseId?: string | null;

  @Column({ name: 'set_type_id', type: 'uuid' })
  setTypeId!: string;

  @Column({ name: 'set_order', type: 'int' })
  setOrder!: number;

  @Column({ name: 'reps', type: 'int', nullable: true })
  reps?: number | null;

  @Column({ name: 'weight', type: 'float', nullable: true })
  weight?: number | null;

  @Column({ name: 'rest_time', type: 'int', nullable: true })
  restTime?: number | null;

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration?: number | null;
}

@Entity({ name: 'repy_set_record_l' })
export class SetRecordEntity {
  @PrimaryColumn('uuid', { name: 'record_id' })
  recordId!: string;

  @Column({ name: 'set_id', type: 'uuid' })
  setId!: string;

  @Column({ name: 'actual_reps', type: 'int', nullable: true })
  actualReps?: number | null;

  @Column({ name: 'actual_weight', type: 'float', nullable: true })
  actualWeight?: number | null;

  @Column({ name: 'actual_rest_time', type: 'int', nullable: true })
  actualRestTime?: number | null;

  @Column({ name: 'actual_duration', type: 'int', nullable: true })
  actualDuration?: number | null;

  @Column({ name: 'was_completed', type: 'boolean' })
  wasCompleted!: boolean;
}
