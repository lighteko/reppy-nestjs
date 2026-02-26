import { Module } from '@nestjs/common';
import { OnboardingController } from '@/modules/onboarding/controller';
import { OnboardingUseCase } from '@/modules/onboarding/usecases';
import { OnboardingRepository } from '@/modules/onboarding/repository';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingUseCase, OnboardingRepository],
})
export class OnboardingModule {}
