import { Module } from '@nestjs/common';
import { AdminController } from '@/modules/admin/controller';
import { AdminUseCase } from '@/modules/admin/usecases';
import { AdminRepository } from '@/modules/admin/repository';

@Module({
  controllers: [AdminController],
  providers: [AdminUseCase, AdminRepository],
})
export class AdminModule {}
