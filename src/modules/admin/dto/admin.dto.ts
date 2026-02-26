import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMuscleDto {
  @IsString()
  locale!: string;

  @IsString()
  muscleName!: string;
}

export class CreateEquipmentDto {
  @IsString()
  locale!: string;

  @IsString()
  equipmentName!: string;

  @IsString()
  instruction!: string;
}

export class CreateExerciseDto {
  @IsString()
  locale!: string;

  @IsUUID('4')
  equipmentId!: string;

  @IsUUID('4')
  mainMuscleId!: string;

  @IsOptional()
  @IsUUID('4')
  auxMuscleId?: string;

  @IsInt()
  difficultyLevel!: number;

  @IsString()
  exerciseName!: string;

  @IsString()
  instruction!: string;
}

export class GetByLocaleDto {
  @IsString()
  locale!: string;
}
