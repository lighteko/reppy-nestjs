import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { CreateFeedbackDto } from '@/modules/feedbacks/dto';

interface ExistsRow {
  '?column?': number;
}

@Injectable()
export class FeedbacksRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private queryRows<T>(sql: string, params: unknown[]): Promise<T[]> {
    return this.dataSource.query(sql, params);
  }

  async userExists(userId: string): Promise<boolean> {
    const rows = await this.queryRows<ExistsRow>(
      `
            SELECT 1
            FROM repy_user_l
            WHERE user_id = $1;
            `,
      [userId],
    );
    return rows.length > 0;
  }

  async createFeedback(input: CreateFeedbackDto): Promise<void> {
    const feedbackId = uuid4();
    await this.dataSource.query(
      `
            INSERT INTO repy_feedback_l
                (feedback_id, user_id, map_id, sentiment, feedback_text)
            VALUES ($1, $2, $3, $4, $5);
            `,
      [
        feedbackId,
        input.userId,
        input.mapId,
        input.sentiment,
        input.feedbackText,
      ],
    );
  }
}
