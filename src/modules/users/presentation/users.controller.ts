import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersUseCase } from '@/modules/users/application/users.usecase';
import { UpdateUserEquipmentsDto } from '@/modules/users/domain/dto/users.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usecase: UsersUseCase) {}

  @Get('status')
  async getOnboardingStatus(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const response = await this.usecase.getUserOnboardingStatus(userId);
    return { data: { ...response } };
  }

  @Patch('equipments')
  async updateEquipments(
    @Body() body: UpdateUserEquipmentsDto,
    @Req() req: any,
  ) {
    const userId = body.userId ?? req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    await this.usecase.updateUserEquipments({ ...body, userId });
    return {
      data: { message: 'Equipments bounded to the user successfully.' },
    };
  }

  @Get('equipments')
  async getEquipmentCodes(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const codes = await this.usecase.getUserEquipmentCodes({ userId });
    return { data: { codes } };
  }

  @Get('exercises')
  async getExerciseCodes(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('Missing userId');
    const codes = await this.usecase.getUserExerciseCodes({ userId });
    return { data: { codes } };
  }
}
