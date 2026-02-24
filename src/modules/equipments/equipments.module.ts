import { Module } from '@nestjs/common';
import { EquipmentsController } from '@/modules/equipments/presentation/equipments.controller';
import { EquipmentsUseCase } from '@/modules/equipments/application/equipments.usecase';
import { EquipmentsRepository } from '@/modules/equipments/infrastructure/equipments.repository';

@Module({
  controllers: [EquipmentsController],
  providers: [EquipmentsUseCase, EquipmentsRepository],
})
export class EquipmentsModule {}
