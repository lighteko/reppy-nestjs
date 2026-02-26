import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutinesRepository } from '@/modules/routines/repository';
import {
  CreateBatchRoutinesDto,
  CreateRoutineDto,
  UpdateProgramDto,
} from '@/modules/routines/dto';
import { ProgramNotFoundError } from '@/modules/routines/errors';

@Injectable()
export class RoutinesUseCase {
  constructor(
    private readonly repo: RoutinesRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createRoutine(input: CreateRoutineDto): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const programExists = await this.repo.programExists(
        input.programId,
        input.userId,
        manager,
      );
      if (!programExists) {
        throw new ProgramNotFoundError();
      }
      const routineId = await this.repo.insertRoutine(input, manager);
      await this.repo.mapProgramRoutine(input.programId, routineId, manager);
      const routineVersionId = await this.repo.insertRoutineVersion(
        routineId,
        input.userId,
        manager,
      );
      for (const plan of input.plans) {
        const planId = await this.repo.insertExercisePlan(
          routineVersionId,
          plan,
          manager,
        );
        for (const set of plan.sets) {
          await this.repo.insertExerciseSet(planId, set, manager);
        }
      }
      return routineVersionId;
    });
  }

  async createBatchRoutines(input: CreateBatchRoutinesDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const programExists = await this.repo.programExists(
        input.programId,
        input.userId,
        manager,
      );
      if (!programExists) {
        throw new ProgramNotFoundError();
      }
      for (const routine of input.routines) {
        const routineId = await this.repo.insertRoutine(
          {
            programId: input.programId,
            userId: input.userId,
            routineName: routine.routineName,
            routineOrder: routine.routineOrder,
            plans: routine.plans,
          },
          manager,
        );
        await this.repo.mapProgramRoutine(input.programId, routineId, manager);
        const routineVersionId = await this.repo.insertRoutineVersion(
          routineId,
          input.userId,
          manager,
        );
        for (const plan of routine.plans) {
          const planId = await this.repo.insertExercisePlan(
            routineVersionId,
            plan,
            manager,
          );
          for (const set of plan.sets) {
            await this.repo.insertExerciseSet(planId, set, manager);
          }
        }
      }
    });
  }

  async updateProgram(input: UpdateProgramDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const programExists = await this.repo.programExists(
        input.programId,
        input.userId,
        manager,
      );
      if (!programExists) {
        throw new ProgramNotFoundError();
      }
      if (!input.goal) {
        await this.repo.updateProgram(input, manager);
      } else {
        // TODO: Send update req to SQS.
      }
    });
  }
}
