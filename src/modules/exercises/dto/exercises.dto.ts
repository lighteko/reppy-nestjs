import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateExercisePlanDto {
  @IsUUID('4')
  exerciseId!: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsString()
  description!: string;
}

export class CreateExerciseSetDto {
  @IsUUID('4')
  exerciseId!: string;

  @IsUUID('4')
  planId!: string;

  @IsUUID('4')
  setTypeId!: string;

  @IsInt()
  setOrder!: number;

  @IsOptional()
  @IsInt()
  reps?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsInt()
  restTime!: number;

  @IsOptional()
  @IsInt()
  duration?: number;
}

export class CreateSetRecordDto {
  @IsUUID('4')
  setId!: string;

  @IsOptional()
  @IsInt()
  actualReps?: number;

  @IsOptional()
  @IsInt()
  actualWeight?: number;

  @IsInt()
  actualRestTime!: number;

  @IsOptional()
  @IsInt()
  actualDuration?: number;

  @IsBoolean()
  wasCompleted!: boolean;
}
