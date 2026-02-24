import { Module } from '@nestjs/common';
import { AdminController } from '@/modules/admin/presentation/admin.controller';
import { AdminUseCase } from '@/modules/admin/application/admin.usecase';
import { AdminRepository } from '@/modules/admin/infrastructure/admin.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminUseCase, AdminRepository],
})
export class AdminModule {}
