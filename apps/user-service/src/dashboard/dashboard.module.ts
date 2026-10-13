import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Course } from 'libs/database/src/entities/course.entity';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { ApprovalQueue } from 'libs/database/src/entities/approval-queue.entity';
import { CourseReview } from 'libs/database/src/entities/course-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Enrollment,
      ApprovalQueue,
      CourseReview,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
