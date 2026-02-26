import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { EquipmentsUseCase } from '@/modules/equipments/usecases';
import {
  EquipmentType,
  GetEquipmentPresetsDto,
} from '@/modules/equipments/dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('equipments')
@UseGuards(AuthGuard)
export class EquipmentsController {
  constructor(private readonly usecase: EquipmentsUseCase) {}

  @Get()
  async getFiltered(
    @Query('locale') locale: string,
    @Query(
      'exclude',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    exclude?: string[],
  ) {
    const typesToExclude = (exclude ?? []).filter(
      (value): value is EquipmentType =>
        Object.values(EquipmentType).includes(value as EquipmentType),
    );
    const data = await this.usecase.getFilteredEquipments({
      locale,
      typesToExclude,
    });
    return { data };
  }

  @Get('presets')
  async getPresets(@Query() query: GetEquipmentPresetsDto) {
    const data = await this.usecase.getEquipmentPresets({
      locale: query.locale,
    });
    return { data };
  }
}
