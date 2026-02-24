import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OnboardingUseCase } from '@/modules/onboarding/application/onboarding.usecase';
import { OnboardUserDto } from '@/modules/onboarding/domain/dto/onboarding.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly usecase: OnboardingUseCase) {}

  @Post()
  async onboard(@Body() body: OnboardUserDto) {
    await this.usecase.onboardUser(body);
    return { data: { message: 'User onboarded successfully.' } };
  }
}
