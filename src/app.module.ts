import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { OnboardingModule } from '@/modules/onboarding/onboarding.module';
import { RoutinesModule } from '@/modules/routines/routines.module';
import { FeedbacksModule } from '@/modules/feedbacks/feedbacks.module';
import { ExercisesModule } from '@/modules/exercises/exercises.module';
import { ChatsModule } from '@/modules/chats/chats.module';
import { UsersModule } from '@/modules/users/users.module';
import { EquipmentsModule } from '@/modules/equipments/equipments.module';
import { AdminModule } from '@/modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PG_HOST') ?? '127.0.0.1',
        port: Number(config.get<string>('PG_PORT') ?? 5432),
        username: config.get<string>('PG_USER') ?? 'postgres',
        password: config.get<string>('PG_PASSWORD') ?? 'postgres',
        database: config.get<string>('PG_DB') ?? 'template',
        schema: config.get<string>('PG_SCHEMA') ?? undefined,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    CommonModule,
    AuthModule,
    OnboardingModule,
    RoutinesModule,
    FeedbacksModule,
    ExercisesModule,
    ChatsModule,
    UsersModule,
    EquipmentsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
