import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { EquipmentsUseCase } from '@/modules/equipments/application/equipments.usecase';
import { GetEquipmentPresetsDto } from '@/modules/equipments/domain/dto/equipments.dto';
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
    const data = await this.usecase.getFilteredEquipments({
      locale,
      typesToExclude: (exclude ?? []) as any,
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
