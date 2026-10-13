import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Category } from 'libs/database/src/entities/category.entity';
import { SubCategory} from 'libs/database/src/entities/subcategory.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { CourseReview } from 'libs/database/src/entities/course-review.entity';
import { CourseType } from 'libs/database/src/entities/coursetype.entity';
import { EmailTemplate } from './entities/emailtemplate.entity';
import { Enrollment } from './entities/enrollments.entity';
import { DurationBand } from './entities/durationband.entity';
import { Tag } from './entities/tags.entity';
import { Tax } from './entities/tax.entity';
import { Transaction } from './entities/transactions.entity';
import { Commission } from './entities/commission.entity';
import { Payout } from './entities/payout.entity';
import { ApprovalQueue } from './entities/approval-queue.entity';
import { Settings } from './entities/settings.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [ Admin, User, Category, SubCategory, Course, CourseReview, CourseType, EmailTemplate, Enrollment, DurationBand, Tag, Tax, Transaction, Commission, Payout, ApprovalQueue, Settings ], 
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
