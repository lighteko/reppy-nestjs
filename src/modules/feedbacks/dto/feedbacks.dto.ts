import { IsEnum, IsString, IsUUID } from 'class-validator';

export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
}

export class CreateFeedbackDto {
  @IsUUID('4')
  userId!: string;

  @IsUUID('4')
  mapId!: string;

  @IsEnum(SentimentType)
  sentiment!: SentimentType;

  @IsString()
  feedbackText!: string;
}
