import { Module } from '@nestjs/common';
import { ExercisesController } from '@/modules/exercises/controller';
import { ExercisesUseCase } from '@/modules/exercises/usecases';
import { ExercisesRepository } from '@/modules/exercises/repository';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesUseCase, ExercisesRepository],
})
export class ExercisesModule {}
