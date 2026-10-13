import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'libs/database/src/database.module';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { UploadsModule } from 'libs/common/src/uploads/local/uploads.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './subcategory/subcategory.module';
import { DurationBandModule } from './durationband/durationband.module';
import { CourseTypeModule } from './coursetype/coursetype.module';
import { TagModule } from './Tag/tag.module';
import { TaxModule } from './tax/tax.module';
import { CommissionModule } from './commission/commission.module'
import { UserModule } from './users/users.module'
import { CourseModule } from './course/course.module';
import { AppMailerModule } from 'libs/common/src/utils/mail/mailer.module';
import { EmailTemplateModule } from './emailtemplates/emailtemplates.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ApprovalQueueModule } from './approvalQueue/approvalQueue.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DashboardModule,
    DatabaseModule,
    CategoryModule,
    SubCategoryModule,
    TransactionsModule,
    DurationBandModule,
    EmailTemplateModule,
    TagModule,
    TaxModule,
    CommissionModule,
    UserModule,
    EnrollmentsModule,
    CourseModule,
    UploadsModule,
    SettingsModule,
    CourseTypeModule,
    AppMailerModule,
    ApprovalQueueModule,
    PaginationModule
  ],
})
export class AdminServiceModule {}
