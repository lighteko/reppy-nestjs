import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
  CreateRoutineDto,
  SetDto,
  PlanDto,
  UpdateProgramDto,
} from '@/modules/routines/dto';

interface ExistsRow {
  '?column?': number;
}

@Injectable()
export class RoutinesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private runner(manager?: EntityManager) {
    return manager ?? this.dataSource;
  }

  private queryRows<T>(
    sql: string,
    params: unknown[],
    manager?: EntityManager,
  ): Promise<T[]> {
    return this.runner(manager).query(sql, params);
  }

  async programExists(
    programId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const rows = await this.queryRows<ExistsRow>(
      `
            SELECT 1
            FROM repy_program_l
            WHERE program_id = $1
              AND user_id = $2;
            `,
      [programId, userId],
      manager,
    );
    return rows.length > 0;
  }

  async insertRoutine(input: CreateRoutineDto, manager?: EntityManager) {
    const routineId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_routine_l (routine_id, user_id, routine_name, routine_order)
            VALUES ($1, $2, $3, $4);
            `,
      [routineId, input.userId, input.routineName, input.routineOrder],
    );
    return routineId;
  }

  async mapProgramRoutine(
    programId: string,
    routineId: string,
    manager?: EntityManager,
  ) {
    await this.runner(manager).query(
      `
            INSERT INTO repy_program_routine_map (program_id, routine_id)
            VALUES ($1, $2);
            `,
      [programId, routineId],
    );
  }

  async insertRoutineVersion(
    routineId: string,
    userId: string,
    manager?: EntityManager,
  ) {
    const routineVersionId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_routine_version_l (routine_version_id, routine_id, user_id, is_active)
            VALUES ($1, $2, $3, TRUE);
            `,
      [routineVersionId, routineId, userId],
    );
    return routineVersionId;
  }

  async insertExercisePlan(
    routineVersionId: string,
    plan: PlanDto,
    manager?: EntityManager,
  ) {
    const planId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_exercise_plan_l (plan_id, routine_version_id, exercise_id, exec_order, memo, description)
            VALUES ($1, $2, $3, $4, $5, $6);
            `,
      [
        planId,
        routineVersionId,
        plan.exerciseId,
        plan.execOrder,
        plan.memo ?? null,
        plan.description,
      ],
    );
    return planId;
  }

  async insertExerciseSet(
    planId: string,
    set: SetDto,
    manager?: EntityManager,
  ) {
    const setId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_exercise_set_l (set_id, plan_id, set_type_id, set_order, reps, weight, rest_time, duration)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `,
      [
        setId,
        planId,
        set.setTypeId,
        set.setOrder,
        set.reps ?? null,
        set.weight ?? null,
        set.restTime,
        set.duration ?? null,
      ],
    );
    return setId;
  }

  async updateProgram(input: UpdateProgramDto, manager?: EntityManager) {
    await this.runner(manager).query(
      `
            UPDATE repy_program_l
            SET program_name = COALESCE($1, program_name),
                experience   = COALESCE($2, experience),
                start_date   = COALESCE($3, start_date),
                goal_date    = COALESCE($4, goal_date),
                goal         = COALESCE($5, goal)
            WHERE program_id = $6
              AND user_id = $7;
            `,
      [
        input.programName ?? null,
        input.experience,
        input.startDate ?? null,
        input.goalDate ?? null,
        input.goal ?? null,
        input.programId,
        input.userId,
      ],
    );
  }
}
