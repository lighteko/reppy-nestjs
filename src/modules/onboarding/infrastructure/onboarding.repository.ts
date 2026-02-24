import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { OnboardUserDto } from '@/modules/onboarding/domain/dto/onboarding.dto';

@Injectable()
export class OnboardingRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private runner(manager?: EntityManager) {
    return manager ?? this.dataSource;
  }

  async userExists(userId: string, manager?: EntityManager): Promise<boolean> {
    const rows = await this.runner(manager).query(
      `
            SELECT 1
            FROM repy_user_l
            WHERE user_id = $1;
            `,
      [userId],
    );
    return rows.length > 0;
  }

  async presetExists(
    presetId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const rows = await this.runner(manager).query(
      `
            SELECT 1
            FROM repy_equipment_preset_map
            WHERE preset_id = $1
            LIMIT 1;
            `,
      [presetId],
    );
    return rows.length > 0;
  }

  async upsertUserBio(input: OnboardUserDto, manager?: EntityManager) {
    await this.runner(manager).query(
      `
            INSERT INTO repy_user_bio_l
                (user_id, height, sex, body_weight, birthdate)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE
                SET height = EXCLUDED.height,
                    sex = EXCLUDED.sex,
                    body_weight = EXCLUDED.body_weight,
                    birthdate = EXCLUDED.birthdate;
            `,
      [
        input.userId,
        input.height,
        input.sex,
        input.bodyWeight,
        input.birthdate,
      ],
    );
  }

  async upsertUserPref(input: OnboardUserDto, manager?: EntityManager) {
    await this.runner(manager).query(
      `
            INSERT INTO repy_user_pref_l
                (user_id, unit_system, notif_reminder, locale)
            VALUES ($1, $2, false, $3)
            ON CONFLICT (user_id) DO UPDATE
                SET unit_system = EXCLUDED.unit_system,
                    notif_reminder = EXCLUDED.notif_reminder,
                    locale = EXCLUDED.locale;
            `,
      [input.userId, input.unitSystem, input.locale],
    );
  }

  async markUserOnboarded(userId: string, manager?: EntityManager) {
    await this.runner(manager).query(
      `
            UPDATE repy_user_l
            SET is_onboarded = TRUE
            WHERE user_id = $1
              AND is_onboarded IS DISTINCT FROM TRUE;
            `,
      [userId],
    );
  }

  async getEquipmentIdsByPreset(
    presetId: string,
    manager?: EntityManager,
  ): Promise<string[]> {
    const rows = await this.runner(manager).query(
      `
            SELECT equipment_id
            FROM repy_equipment_preset_map
            WHERE preset_id = $1;
            `,
      [presetId],
    );
    return rows.map((r: any) => r.equipment_id);
  }

  async insertUserEquipments(
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
}
