import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { Commission } from 'libs/database/src/entities/commission.entity';
import { Transaction } from 'libs/database/src/entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, User, Course, Commission, Transaction]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
