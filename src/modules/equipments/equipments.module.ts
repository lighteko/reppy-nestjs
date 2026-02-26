import { Module } from '@nestjs/common';
import { EquipmentsController } from '@/modules/equipments/controller';
import { EquipmentsUseCase } from '@/modules/equipments/usecases';
import { EquipmentsRepository } from '@/modules/equipments/repository';

@Module({
  controllers: [EquipmentsController],
  providers: [EquipmentsUseCase, EquipmentsRepository],
})
export class EquipmentsModule {}
