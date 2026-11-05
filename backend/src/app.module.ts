import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MockUserGuard } from './common/auth/mock-user.guard';
import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [PrismaModule, LessonsModule],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MockUserGuard,
    },
  ],
})
export class AppModule {}