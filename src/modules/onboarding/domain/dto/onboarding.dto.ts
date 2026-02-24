import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NA = 'N/A',
}

export enum UnitSystem {
  CM_KG = 'CM_KG',
  IN_LB = 'IN_LB',
}

export enum Experience {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  PROFESSIONAL = 'PROFESSIONAL',
}

export class OnboardUserDto {
  @IsUUID('4')
  userId!: string;

  @IsEnum(Experience)
  experience!: Experience;

  @IsNumber()
  workoutCapacity!: number;

  @IsEnum(UnitSystem)
  unitSystem!: UnitSystem;

  @IsUUID('4')
  presetId!: string;

  @IsString()
  locale!: string;

  @IsEnum(Sex)
  sex!: Sex;

  @IsNumber()
  height!: number;

  @IsNumber()
  bodyWeight!: number;

  @IsString()
  birthdate!: string;

  @IsString()
  goal!: string;

  @IsString()
  startDate!: string;

  @IsString()
  goalDate!: string;
}
