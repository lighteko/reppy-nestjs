import { Controller, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { RoutinesUseCase } from '@/modules/routines/application/routines.usecase';
import {
  CreateBatchRoutinesDto,
  CreateRoutineDto,
  UpdateProgramDto,
} from '@/modules/routines/domain/dto/routines.dto';
import { AuthGuard } from '@/common/auth/auth.guard';

@Controller('routines')
@UseGuards(AuthGuard)
export class RoutinesController {
  constructor(private readonly usecase: RoutinesUseCase) {}

  @Post()
  async createRoutine(@Body() body: CreateRoutineDto) {
    const routineId = await this.usecase.createRoutine(body);
    return { data: { message: 'Routine created successfully', routineId } };
  }

  @Post('batch')
  async createBatch(@Body() body: CreateBatchRoutinesDto) {
    await this.usecase.createBatchRoutines(body);
    return { data: { message: 'Routines created successfully' } };
  }

  @Patch('programs')
  async updateProgram(@Body() body: UpdateProgramDto) {
    await this.usecase.updateProgram(body);
    return { data: { message: 'Program updated successfully' } };
  }
}
