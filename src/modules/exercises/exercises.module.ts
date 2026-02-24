import { Module } from '@nestjs/common';
import { ExercisesController } from '@/modules/exercises/presentation/exercises.controller';
import { ExercisesUseCase } from '@/modules/exercises/application/exercises.usecase';
import { ExercisesRepository } from '@/modules/exercises/infrastructure/exercises.repository';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesUseCase, ExercisesRepository],
})
export class ExercisesModule {}
