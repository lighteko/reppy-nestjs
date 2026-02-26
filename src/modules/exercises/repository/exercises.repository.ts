import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
  CreateExercisePlanDto,
  CreateExerciseSetDto,
  CreateSetRecordDto,
} from '@/modules/exercises/dto';

interface ExistsRow {
  '?column?': number;
}

@Injectable()
export class ExercisesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private queryRows<T>(sql: string, params: unknown[]): Promise<T[]> {
    return this.dataSource.query(sql, params);
  }

  async planExists(planId: string): Promise<boolean> {
    const rows = await this.queryRows<ExistsRow>(
      `
            SELECT 1
            FROM repy_exercise_plan_l
            WHERE plan_id = $1;
            `,
      [planId],
    );
    return rows.length > 0;
  }

  async setExists(setId: string): Promise<boolean> {
    const rows = await this.queryRows<ExistsRow>(
      `
            SELECT 1
            FROM repy_exercise_set_l
            WHERE set_id = $1;
            `,
      [setId],
    );
    return rows.length > 0;
  }

  async createExercisePlan(input: CreateExercisePlanDto): Promise<string> {
    const planId = uuid4();
    await this.dataSource.query(
      `
            INSERT INTO repy_exercise_plan_l
                (plan_id, exercise_id, memo, description)
            VALUES ($1, $2, $3, $4);
            `,
      [planId, input.exerciseId, input.memo ?? null, input.description],
    );
    return planId;
  }

  async createExerciseSet(input: CreateExerciseSetDto): Promise<string> {
    const setId = uuid4();
    await this.dataSource.query(
      `
            INSERT INTO repy_exercise_set_l 
                (set_id, exercise_id, plan_id, set_type_id, set_order, reps, weight, rest_time, duration) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            `,
      [
        setId,
        input.exerciseId,
        input.planId,
        input.setTypeId,
        input.setOrder,
        input.reps ?? null,
        input.weight ?? null,
        input.restTime,
        input.duration ?? null,
      ],
    );
    return setId;
  }

  async createSetRecord(input: CreateSetRecordDto): Promise<string> {
    const recordId = uuid4();
    await this.dataSource.query(
      `
            INSERT INTO repy_set_record_l 
                (record_id, set_id, actual_reps, actual_weight, actual_rest_time, actual_duration, was_completed) 
            VALUES ($1, $2, $3, $4, $5, $6, $7);
            `,
      [
        recordId,
        input.setId,
        input.actualReps ?? null,
        input.actualWeight ?? null,
        input.actualRestTime,
        input.actualDuration ?? null,
        input.wasCompleted,
      ],
    );
    return recordId;
  }
}
