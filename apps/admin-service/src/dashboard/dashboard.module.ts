import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { Commission } from 'libs/database/src/entities/commission.entity';
import { ApprovalQueue } from 'libs/database/src/entities/approval-queue.entity';
import { Payout } from 'libs/database/src/entities/payout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course, Enrollment, Commission, ApprovalQueue, Payout]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
