import { IsArray, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum EquipmentType {
  FREE_WEIGHTS = 'FREE_WEIGHTS',
  BENCHES = 'BENCHES',
  STRETCH = 'STRETCH',
  MACHINES = 'MACHINES',
  CABLES = 'CABLES',
  CARDIO = 'CARDIO',
  BODY_WEIGHTS = 'BODY_WEIGHTS',
}

export class GetFilteredEquipmentsDto {
  @IsString()
  locale!: string;

  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    if (typeof value === 'string') {
      return [value];
    }
    return [];
  })
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  typesToExclude!: EquipmentType[];
}

export class GetEquipmentPresetsDto {
  @IsString()
  locale!: string;
}
