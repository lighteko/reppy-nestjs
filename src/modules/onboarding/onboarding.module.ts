import { Module } from '@nestjs/common';
import { OnboardingController } from '@/modules/onboarding/presentation/onboarding.controller';
import { OnboardingUseCase } from '@/modules/onboarding/application/onboarding.usecase';
import { OnboardingRepository } from '@/modules/onboarding/infrastructure/onboarding.repository';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingUseCase, OnboardingRepository],
})
export class OnboardingModule {}
