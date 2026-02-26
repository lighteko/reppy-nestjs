import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AdminUseCase } from '@/modules/admin/usecases';
import {
  CreateEquipmentDto,
  CreateExerciseDto,
  CreateMuscleDto,
  GetByLocaleDto,
} from '@/modules/admin/dto';
import { AdminGuard } from '@/common/auth/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly usecase: AdminUseCase) {}

  @Post('muscles')
  @UseGuards(AdminGuard)
  async createMuscle(@Body() body: CreateMuscleDto) {
    await this.usecase.createMuscle(body);
    return { data: { message: 'Muscle created successfully' } };
  }

  @Post('equipments')
  @UseGuards(AdminGuard)
  async createEquipment(@Body() body: CreateEquipmentDto) {
    await this.usecase.createEquipment(body);
    return { data: { message: 'Equipment created successfully' } };
  }

  @Post('exercises')
  @UseGuards(AdminGuard)
  async createExercise(@Body() body: CreateExerciseDto) {
    await this.usecase.createExercise(body);
    return { data: { message: 'Exercise created successfully' } };
  }

  @Get('muscles')
  @UseGuards(AdminGuard)
  async getMuscles(@Query() query: GetByLocaleDto) {
    const payload = await this.usecase.getMuscles(query.locale);
    return { data: payload };
  }

  @Get('equipments')
  @UseGuards(AdminGuard)
  async getEquipments(@Query() query: GetByLocaleDto) {
    const payload = await this.usecase.getEquipments(query.locale);
    return { data: payload };
  }

  @Get('exercises')
  @UseGuards(AdminGuard)
  async getExercises(@Query() query: GetByLocaleDto) {
    const payload = await this.usecase.getExercises(query.locale);
    return { data: payload };
  }

  @Get('login')
  @UseGuards(AdminGuard)
  login() {
    return { data: { message: 'Logged in successfully' } };
  }
}
