import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTransactionsController } from './transactions.controller';
import { UserTransactionsService } from './transactions.service';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { Transaction } from 'libs/database/src/entities/transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, User, Course, Transaction])],
  controllers: [UserTransactionsController],
  providers: [UserTransactionsService],
})
export class UserTransactionsModule {}
