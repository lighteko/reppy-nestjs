import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdminRepository } from '@/modules/admin/infrastructure/admin.repository';
import {
  CreateEquipmentDto,
  CreateExerciseDto,
  CreateMuscleDto,
} from '@/modules/admin/domain/dto/admin.dto';
import {
  EquipmentNotFoundError,
  MuscleNotFoundError,
} from '@/modules/admin/domain/errors/admin.errors';

@Injectable()
export class AdminUseCase {
  constructor(
    private readonly repo: AdminRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getMuscles(locale: string) {
    return this.repo.getMuscles(locale);
  }

  async getEquipments(locale: string) {
    return this.repo.getEquipments(locale);
  }

  async getExercises(locale: string) {
    return this.repo.getExercises(locale);
  }

  async createMuscle(input: CreateMuscleDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const muscleId = await this.repo.insertMuscle(manager);
      await this.repo.insertMuscleI18n(muscleId, input, manager);
    });
  }

  async createEquipment(input: CreateEquipmentDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const equipmentId = await this.repo.insertEquipment(manager);
      await this.repo.insertEquipmentI18n(equipmentId, input, manager);
    });
  }

  async createExercise(input: CreateExerciseDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const equipmentExists = await this.repo.equipmentExists(
        input.equipmentId,
        manager,
      );
      if (!equipmentExists) {
        throw new EquipmentNotFoundError();
      }
      const mainMuscleExists = await this.repo.muscleExists(
        input.mainMuscleId,
        manager,
      );
      if (!mainMuscleExists) {
        throw new MuscleNotFoundError();
      }
      if (input.auxMuscleId) {
        const auxMuscleExists = await this.repo.muscleExists(
          input.auxMuscleId,
          manager,
        );
        if (!auxMuscleExists) {
          throw new MuscleNotFoundError();
        }
      }
      const exerciseId = await this.repo.insertExercise(input, manager);
      await this.repo.insertExerciseI18n(exerciseId, input, manager);
    });
  }
}
