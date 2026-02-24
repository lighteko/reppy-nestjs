import { Module } from '@nestjs/common';
import { RoutinesController } from '@/modules/routines/presentation/routines.controller';
import { RoutinesUseCase } from '@/modules/routines/application/routines.usecase';
import { RoutinesRepository } from '@/modules/routines/infrastructure/routines.repository';

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesUseCase, RoutinesRepository],
})
export class RoutinesModule {}
