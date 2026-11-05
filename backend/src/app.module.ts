import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClassesModule } from './classes/classes.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MockUserGuard } from './common/auth/mock-user.guard';
import { LessonsModule } from './lessons/lessons.module';
import { SubjectsModule } from './subjects/subjects.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    PrismaModule,
    LessonsModule,
    SubjectsModule,
    CoursesModule,
    ClassesModule,
  ],
  controllers: [
    AppController,
    HealthController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MockUserGuard,
    },
  ],
})
export class AppModule {}