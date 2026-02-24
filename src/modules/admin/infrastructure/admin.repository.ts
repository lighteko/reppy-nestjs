import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
  CreateEquipmentDto,
  CreateExerciseDto,
  CreateMuscleDto,
} from '@/modules/admin/domain/dto/admin.dto';

@Injectable()
export class AdminRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private runner(manager?: EntityManager) {
    return manager ?? this.dataSource;
  }

  async equipmentExists(
    equipmentId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const rows = await this.runner(manager).query(
      `
            SELECT 1
            FROM repy_equipment_m
            WHERE equipment_id = $1;
            `,
      [equipmentId],
    );
    return rows.length > 0;
  }

  async muscleExists(
    muscleId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const rows = await this.runner(manager).query(
      `
            SELECT 1
            FROM repy_muscle_m
            WHERE muscle_id = $1;
            `,
      [muscleId],
    );
    return rows.length > 0;
  }

  async getMuscles(locale: string) {
    return this.dataSource.query(
      `
            SELECT m.muscle_id      AS "muscleId",
                   i18n.muscle_name AS "muscleName",
                   i18n.locale      AS "locale"
            FROM repy_muscle_m m
                LEFT JOIN repy_muscle_i18n_m i18n
                    ON m.muscle_id = i18n.muscle_id
                    AND i18n.locale = $1;
            `,
      [locale],
    );
  }

  async getEquipments(locale: string) {
    return this.dataSource.query(
      `
            SELECT eq.equipment_id     AS "equipmentId",
                   i18n.equipment_name AS "equipmentName",
                   i18n.instruction    AS "instruction",
                   i18n.locale         AS "locale"
            FROM repy_equipment_m eq
                LEFT JOIN repy_equipment_i18n_m i18n
                    ON eq.equipment_id = i18n.equipment_id
                    AND i18n.locale = $1;
            `,
      [locale],
    );
  }

  async getExercises(locale: string) {
    return this.dataSource.query(
      `
            SELECT exc.exercise_id        AS "exerciseId",
                   exc.equipment_id       AS "equipmentId",
                   exc.main_muscle_id     AS "mainMuscleId",
                   exc.aux_muscle_id      AS "auxMuscleId",
                   exc.difficulty_level   AS "difficultyLevel",
                   i18n.exercise_name     AS "exerciseName",
                   i18n.instruction       AS "instruction",
                   i18n.locale            AS "locale"
            FROM repy_exercise_m AS exc
                LEFT JOIN repy_exercise_i18n_m AS i18n
                    ON i18n.exercise_id = exc.exercise_id
                    AND i18n.locale = $1;
            `,
      [locale],
    );
  }

  async insertMuscle(manager?: EntityManager): Promise<string> {
    const muscleId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_muscle_m (muscle_id)
            VALUES ($1);
            `,
      [muscleId],
    );
    return muscleId;
  }

  async insertMuscleI18n(
    muscleId: string,
    input: CreateMuscleDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runner(manager).query(
      `
            INSERT INTO repy_muscle_i18n_m
                (muscle_i18n_id, locale, muscle_id, muscle_name)
            VALUES ($1, $2, $3, $4);
            `,
      [uuid4(), input.locale, muscleId, input.muscleName],
    );
  }

  async insertEquipment(manager?: EntityManager): Promise<string> {
    const equipmentId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_equipment_m (equipment_id)
            VALUES ($1);
            `,
      [equipmentId],
    );
    return equipmentId;
  }

  async insertEquipmentI18n(
    equipmentId: string,
    input: CreateEquipmentDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runner(manager).query(
      `
            INSERT INTO repy_equipment_i18n_m
                (equipment_i18n_id, locale, equipment_id, equipment_name, instruction)
            VALUES ($1, $2, $3, $4, $5);
            `,
      [
        uuid4(),
        input.locale,
        equipmentId,
        input.equipmentName,
        input.instruction,
      ],
    );
  }

  async insertExercise(
    input: CreateExerciseDto,
    manager?: EntityManager,
  ): Promise<string> {
    const exerciseId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_exercise_m (exercise_id, equipment_id, main_muscle_id, aux_muscle_id, difficulty_level)
            VALUES ($1, $2, $3, $4, $5);
            `,
      [
        exerciseId,
        input.equipmentId,
        input.mainMuscleId,
        input.auxMuscleId ?? null,
        input.difficultyLevel,
      ],
    );
    return exerciseId;
  }

  async insertExerciseI18n(
    exerciseId: string,
    input: CreateExerciseDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runner(manager).query(
      `
            INSERT INTO repy_exercise_i18n_m
                (exercise_i18n_id, locale, exercise_id, exercise_name, instruction)
            VALUES ($1, $2, $3, $4, $5);
            `,
      [
        uuid4(),
        input.locale,
        exerciseId,
        input.exerciseName,
        input.instruction,
      ],
    );
  }
}
