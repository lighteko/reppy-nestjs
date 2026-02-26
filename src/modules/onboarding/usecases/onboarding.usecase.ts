import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OnboardingRepository } from '@/modules/onboarding/repository';
import { OnboardUserDto } from '@/modules/onboarding/dto';
import {
  OnboardingUserNotFoundError,
  PresetNotFoundError,
} from '@/modules/onboarding/errors';

@Injectable()
export class OnboardingUseCase {
  constructor(
    private readonly repo: OnboardingRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onboardUser(input: OnboardUserDto) {
    await this.dataSource.transaction(async (manager) => {
      const userExists = await this.repo.userExists(input.userId, manager);
      if (!userExists) {
        throw new OnboardingUserNotFoundError();
      }
      const presetExists = await this.repo.presetExists(
        input.presetId,
        manager,
      );
      if (!presetExists) {
        throw new PresetNotFoundError();
      }
      await this.repo.upsertUserBio(input, manager);
      await this.repo.upsertUserPref(input, manager);
      await this.repo.markUserOnboarded(input.userId, manager);
      const equipmentIds = await this.repo.getEquipmentIdsByPreset(
        input.presetId,
        manager,
      );
      await this.repo.insertUserEquipments(input.userId, equipmentIds, manager);
    });
    // TODO: enqueue program generation
  }
}
