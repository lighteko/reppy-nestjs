import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'repy_feedback_l' })
export class FeedbackEntity {
  @PrimaryColumn('uuid', { name: 'feedback_id' })
  feedbackId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'map_id', type: 'uuid' })
  mapId!: string;

  @Column({ name: 'sentiment', type: 'text' })
  sentiment!: string;

  @Column({ name: 'feedback_text', type: 'text' })
  feedbackText!: string;
}
