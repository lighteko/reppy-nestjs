import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserEquipmentsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  addedEquipmentIds!: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  removedEquipmentIds!: string[];

  @IsOptional()
  @IsUUID('4')
  userId?: string;
}

export class GetUserEquipmentCodesDto {
  @IsUUID('4')
  userId!: string;
}

export class GetUserExerciseCodesDto {
  @IsUUID('4')
  userId!: string;
}

export class GetUserOnboardingStatusDto {
  @IsUUID('4')
  userId!: string;
}
