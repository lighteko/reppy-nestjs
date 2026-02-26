import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ExercisesUseCase } from '@/modules/exercises/usecases';
import {
  CreateExercisePlanDto,
  CreateExerciseSetDto,
  CreateSetRecordDto,
} from '@/modules/exercises/dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('exercises')
@UseGuards(AuthGuard)
export class ExercisesController {
  constructor(private readonly usecase: ExercisesUseCase) {}

  @Post('plans')
  async createPlan(@Body() body: CreateExercisePlanDto) {
    const planId = await this.usecase.createExercisePlan(body);
    return { data: { message: 'Exercise plan created successfully', planId } };
  }

  @Post('sets')
  async createSet(@Body() body: CreateExerciseSetDto) {
    const setId = await this.usecase.createExerciseSet(body);
    return { data: { message: 'Exercise set created successfully', setId } };
  }

  @Post('records')
  async createRecord(@Body() body: CreateSetRecordDto) {
    const recordId = await this.usecase.createSetRecord(body);
    return { data: { message: 'Set record created successfully', recordId } };
  }
}
