import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersRepository } from '@/modules/users/repository';
import {
  GetUserEquipmentCodesDto,
  GetUserExerciseCodesDto,
  UpdateUserEquipmentsDto,
} from '@/modules/users/dto';
import { UserNotFoundError } from '@/modules/users/errors';

@Injectable()
export class UsersUseCase {
  constructor(
    private readonly repo: UsersRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async updateUserEquipments(input: UpdateUserEquipmentsDto) {
    await this.dataSource.transaction(async (manager) => {
      const exists = await this.repo.userExists(input.userId!, manager);
      if (!exists) {
        throw new UserNotFoundError();
      }
      await this.repo.removeUserEquipments(
        input.userId!,
        input.removedEquipmentIds,
        manager,
      );
      await this.repo.addUserEquipments(
        input.userId!,
        input.addedEquipmentIds,
        manager,
      );
    });
  }

  async getUserEquipmentCodes(input: GetUserEquipmentCodesDto) {
    const exists = await this.repo.userExists(input.userId);
    if (!exists) {
      throw new UserNotFoundError();
    }
    return this.repo.getUserEquipmentCodes(input);
  }

  async getUserExerciseCodes(input: GetUserExerciseCodesDto) {
    const exists = await this.repo.userExists(input.userId);
    if (!exists) {
      throw new UserNotFoundError();
    }
    return this.repo.getUserExerciseCodes(input);
  }

  async getUserOnboardingStatus(userId: string) {
    const status = await this.repo.getUserOnboardingStatus(userId);
    if (!status) {
      throw new UserNotFoundError();
    }
    return status;
  }
}
