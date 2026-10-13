import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'libs/database/src/database.module';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from 'libs/common/src/uploads/local/uploads.module';
import { AwsUploadsModule } from 'libs/common/src/uploads/aws/aws-uploads.module'
import { CourseModule } from './courses/courses.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { PayoutModule } from './payout/payout.module';
import { UserTransactionsModule } from './transactions/transactions.module'
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from 'apps/admin-service/src/settings/settings.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), 'uploads'),
          serveRoot: '/uploads', 
          serveStaticOptions: {
                 index: false, 
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    SettingsModule,
    AwsUploadsModule,
    UploadsModule,
    process.env.USE_AWS === "true" ? AwsUploadsModule : UploadsModule,
    DatabaseModule,
    CourseModule,
    PayoutModule,
    EnrollmentModule,
    PaginationModule,
    UserTransactionsModule,
    DashboardModule,
  ],
})
export class UserServiceModule {}
