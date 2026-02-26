import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import {
  LoginPayloadDto,
  SignUpWithOAuthDto,
  SignUpWithPasswordDto,
} from '@/modules/auth/dto';

export interface AuthUserInfoRow {
  userId: string;
  username: string;
  email: string;
  password: string | null;
  sex: string | null;
  height: number | null;
  bodyWeight: number | null;
  birthdate: string | null;
  age: number | null;
  unitSystem: string | null;
  notifReminder: boolean | null;
  locale: string | null;
}

export interface AuthUserCredentialsRow {
  userId: string;
  password: string | null;
}

@Injectable()
export class AuthRepository {
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

  async createUserWithPassword(
    input: SignUpWithPasswordDto,
    manager?: EntityManager,
  ): Promise<void> {
    await this.runner(manager).query(
      `
            INSERT INTO repy_user_l
                (username, email, password)
            VALUES ($1, $2, $3)
            `,
      [input.username, input.email, input.password],
    );
  }

  async createUserWithOAuth(
    input: SignUpWithOAuthDto,
    manager?: EntityManager,
  ): Promise<void> {
    const userId = uuid4();
    await this.runner(manager).query(
      `
            INSERT INTO repy_user_l
                (user_id, username, email, provider, sub)
            VALUES ($1, $2, $3, $4, $5)
            `,
      [userId, input.username, input.email, input.provider, input.sub],
    );
  }

  async getUserInfoByEmail(
    email: string,
    manager?: EntityManager,
  ): Promise<AuthUserInfoRow | null> {
    const rows = await this.queryRows<AuthUserInfoRow>(
      `
            SELECT u.user_id                                           AS "userId",
                   u.username                                          AS username,
                   u.email                                             AS email,
                   u.password                                          AS password,
                   bio.sex                                             AS sex,
                   bio.height                                          AS height,
                   bio.body_weight                                     AS "bodyWeight",
                   bio.birthdate                                       AS birthdate,
                   EXTRACT(YEAR FROM AGE(CURRENT_DATE, bio.birthdate)) AS age,
                   pref.unit_system                                    AS "unitSystem",
                   pref.notif_reminder                                 AS "notifReminder",
                   pref.locale                                         AS "locale"
            FROM repy_user_l u
                     LEFT JOIN repy_user_bio_l bio
                               ON u.user_id = bio.user_id
                     LEFT JOIN repy_user_pref_l pref
                               ON u.user_id = pref.user_id
            WHERE u.email = $1;
            `,
      [email],
      manager,
    );
    return rows[0] ?? null;
  }

  async getUserIdAndPwdByEmail(
    input: LoginPayloadDto,
    manager?: EntityManager,
  ): Promise<AuthUserCredentialsRow | null> {
    const rows = await this.queryRows<AuthUserCredentialsRow>(
      `
            SELECT user_id  AS "userId",
                   password AS password
            FROM repy_user_l
            WHERE email = $1;
            `,
      [input.email],
      manager,
    );
    return rows[0] ?? null;
  }
}
