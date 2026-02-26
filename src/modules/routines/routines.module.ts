import { Module } from '@nestjs/common';
import { RoutinesController } from '@/modules/routines/controller';
import { RoutinesUseCase } from '@/modules/routines/usecases';
import { RoutinesRepository } from '@/modules/routines/repository';

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesUseCase, RoutinesRepository],
})
export class RoutinesModule {}
