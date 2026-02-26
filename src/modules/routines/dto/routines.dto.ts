import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Experience {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  PROFESSIONAL = 'PROFESSIONAL',
}

export class UpdateProgramDto {
  @IsUUID('4')
  programId!: string;

  @IsUUID('4')
  userId!: string;

  @IsOptional()
  @IsString()
  programName?: string;

  @IsEnum(Experience)
  experience!: Experience;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  goalDate?: string;

  @IsOptional()
  @IsString()
  goal?: string;
}

export class SetDto {
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

export class PlanDto {
  @IsUUID('4')
  exerciseId!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsInt()
  execOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets!: SetDto[];
}

export class RoutineDto {
  @IsString()
  routineName!: string;

  @IsInt()
  routineOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  plans!: PlanDto[];
}

export class CreateBatchRoutinesDto {
  @IsUUID('4')
  programId!: string;

  @IsUUID('4')
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineDto)
  routines!: RoutineDto[];
}

export class CreateRoutineDto {
  @IsUUID('4')
  programId!: string;

  @IsUUID('4')
  userId!: string;

  @IsString()
  routineName!: string;

  @IsInt()
  routineOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  plans!: PlanDto[];
}
