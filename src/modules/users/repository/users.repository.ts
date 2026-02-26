import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import {
  GetUserEquipmentCodesDto,
  GetUserExerciseCodesDto,
} from '@/modules/users/dto';

interface ExistsRow {
  '?column?': number;
}

export interface UserEquipmentCodeRow {
  equipment_code: string;
}

export interface UserExerciseCodeRow {
  exercise_code: string;
}

export interface UserOnboardingStatusRow {
  isOnboarded: boolean;
}

@Injectable()
export class UsersRepository {
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

  async userExists(userId: string, manager?: EntityManager): Promise<boolean> {
    const rows = await this.queryRows<ExistsRow>(
      `
            SELECT 1
            FROM repy_user_l
            WHERE user_id = $1;
            `,
      [userId],
      manager,
    );
    return rows.length > 0;
  }

  async removeUserEquipments(
    userId: string,
    equipmentIds: string[],
    manager?: EntityManager,
  ) {
    if (!equipmentIds.length) return;
    await this.runner(manager).query(
      `
            DELETE FROM repy_user_equipment_map
            WHERE user_id = $1
              AND equipment_id = ANY($2::uuid[]);
            `,
      [userId, equipmentIds],
    );
  }

  async addUserEquipments(
    userId: string,
    equipmentIds: string[],
    manager?: EntityManager,
  ) {
    for (const equipmentId of equipmentIds) {
      await this.runner(manager).query(
        `
                INSERT INTO repy_user_equipment_map (user_id, equipment_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, equipment_id) DO NOTHING;
                `,
        [userId, equipmentId],
      );
    }
  }

  async getUserEquipmentCodes(
    input: GetUserEquipmentCodesDto,
  ): Promise<UserEquipmentCodeRow[]> {
    return this.queryRows<UserEquipmentCodeRow>(
      `
            SELECT e.equipment_code
            FROM repy_equipment_m AS e
                     JOIN repy_user_equipment_map AS m
                          ON e.equipment_id = m.equipment_id
            WHERE m.user_id = $1;
            `,
      [input.userId],
    );
  }

  async getUserExerciseCodes(
    input: GetUserExerciseCodesDto,
  ): Promise<UserExerciseCodeRow[]> {
    return this.queryRows<UserExerciseCodeRow>(
      `
            SELECT ex.exercise_code
            FROM repy_exercise_m AS ex
                     JOIN repy_equipment_m AS eq
                          ON ex.equipment_id = eq.equipment_id
                     JOIN repy_user_equipment_map AS uem
                          ON eq.equipment_id = uem.equipment_id
            WHERE uem.user_id = $1;
            `,
      [input.userId],
    );
  }

  async getUserOnboardingStatus(
    userId: string,
  ): Promise<UserOnboardingStatusRow | null> {
    const rows = await this.queryRows<UserOnboardingStatusRow>(
      `
            SELECT is_onboarded AS "isOnboarded" FROM repy_user_l
            WHERE user_id = $1;
            `,
      [userId],
    );
    return rows[0] ?? null;
  }
}
