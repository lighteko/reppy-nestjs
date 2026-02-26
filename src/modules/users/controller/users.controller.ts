import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersUseCase } from '@/modules/users/usecases';
import { UpdateUserEquipmentsDto } from '@/modules/users/dto';
import type { AuthenticatedRequest } from '@/common/auth/auth-request';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usecase: UsersUseCase) {}

  @Get('status')
  async getOnboardingStatus(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const response = await this.usecase.getUserOnboardingStatus(userId);
    return { data: { ...response } };
  }

  @Patch('equipments')
  async updateEquipments(
    @Body() body: UpdateUserEquipmentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = body.userId ?? req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    await this.usecase.updateUserEquipments({ ...body, userId });
    return {
      data: { message: 'Equipments bounded to the users successfully.' },
    };
  }

  @Get('equipments')
  async getEquipmentCodes(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const codes = await this.usecase.getUserEquipmentCodes({ userId });
    return { data: { codes } };
  }

  @Get('exercises')
  async getExerciseCodes(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const codes = await this.usecase.getUserExerciseCodes({ userId });
    return { data: { codes } };
  }
}
