import { Injectable } from '@nestjs/common';
import { ExercisesRepository } from '@/modules/exercises/repository';
import {
  CreateExercisePlanDto,
  CreateExerciseSetDto,
  CreateSetRecordDto,
} from '@/modules/exercises/dto';
import {
  ExercisePlanNotFoundError,
  ExerciseSetNotFoundError,
} from '@/modules/exercises/errors';

@Injectable()
export class ExercisesUseCase {
  constructor(private readonly repo: ExercisesRepository) {}

  async createExercisePlan(input: CreateExercisePlanDto): Promise<string> {
    return this.repo.createExercisePlan(input);
  }

  async createExerciseSet(input: CreateExerciseSetDto): Promise<string> {
    const planExists = await this.repo.planExists(input.planId);
    if (!planExists) {
      throw new ExercisePlanNotFoundError();
    }
    return this.repo.createExerciseSet(input);
  }

  async createSetRecord(input: CreateSetRecordDto): Promise<string> {
    const setExists = await this.repo.setExists(input.setId);
    if (!setExists) {
      throw new ExerciseSetNotFoundError();
    }
    const recordId = await this.repo.createSetRecord(input);
    // TODO: Also need to send a request to the FastAPI server to store the record to Qdrant.
    return recordId;
  }
}
