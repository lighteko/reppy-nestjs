import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GetEquipmentPresetsDto,
  GetFilteredEquipmentsDto,
} from '@/modules/equipments/dto';

export interface FilteredEquipmentRow {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  equipmentCode: string;
  description: string | null;
}

export interface EquipmentPresetRow {
  presetCode: string;
  equipments: unknown;
}

@Injectable()
export class EquipmentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private queryRows<T>(sql: string, params: unknown[]): Promise<T[]> {
    return this.dataSource.query(sql, params);
  }

  async getFilteredEquipments(
    input: GetFilteredEquipmentsDto,
  ): Promise<FilteredEquipmentRow[]> {
    return this.queryRows<FilteredEquipmentRow>(
      `
            SELECT eq.equipment_id    AS "equipmentId",
                   eqi.equipment_name AS "equipmentName",
                   eq.equipment_type  AS "equipmentType",
                   eq.equipment_code  AS "equipmentCode",
                   eqi.description    AS description
            FROM repy_equipment_m AS eq
                     JOIN repy_equipment_i18n_m AS eqi
                          ON eq.equipment_id = eqi.equipment_id
                              AND eqi.locale = $1
            WHERE NOT (
                eq.equipment_type = ANY (
                    COALESCE($2::equipment_type_enum[], ARRAY []::equipment_type_enum[])
                    )
                );
            `,
      [input.locale, input.typesToExclude],
    );
  }

  async getEquipmentPresets(
    input: GetEquipmentPresetsDto,
  ): Promise<EquipmentPresetRow[]> {
    return this.queryRows<EquipmentPresetRow>(
      `
            WITH mapped AS (SELECT m.preset_id,

                                   eq.equipment_id    AS equipment_id,
                                   eqi.equipment_name AS equipment_name,
                                   eq.equipment_type  AS equipment_type,
                                   eq.equipment_code  AS equipment_code,
                                   eqi.description    AS description
                            FROM repy_equipment_preset_map AS m
                                     JOIN repy_equipment_m AS eq
                                          ON eq.equipment_id = m.equipment_id
                                     JOIN repy_equipment_i18n_m AS eqi
                                          ON eq.equipment_id = eqi.equipment_id
                                              AND eqi.locale = $1),
                 agg AS (SELECT preset_id,
                                jsonb_agg(
                                        jsonb_build_object(
                                                'equipmentId', equipment_id,
                                                'equipmentName', equipment_name,
                                                'equipmentType', equipment_type,
                                                'equipmentCode', equipment_code,
                                                'description', description
                                        )
                                        ORDER BY equipment_id
                                ) AS equipments
                         FROM mapped
                         GROUP BY preset_id)
            SELECT p.preset_code                       AS "presetCode",
                   COALESCE(a.equipments, '[]'::jsonb) AS "equipments"
            FROM repy_equipment_preset_m AS p
                     LEFT JOIN agg AS a
                               ON a.preset_id = p.preset_id
            ORDER BY p.preset_code;
            `,
      [input.locale],
    );
  }
}
