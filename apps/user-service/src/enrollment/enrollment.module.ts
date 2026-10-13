import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Course } from 'libs/database/src/entities/course.entity';
import { Tax } from 'libs/database/src/entities/tax.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { EnrollmentService } from './enrollment.service';
import { StripePaymentService } from 'libs/common/src/payments/stripe.service';
import { EnrollmentController } from './enrollment.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { AppMailerModule } from 'libs/common/src/utils/mail/mailer.module';
import { AwsUploadsModule } from 'libs/common/src/uploads/aws/aws-uploads.module'
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { ApprovalQueue } from 'libs/database/src/entities/approval-queue.entity';
import { CommissionHelper } from 'libs/common/src/utils/commission/commission.helper';
import { Commission } from 'libs/database/src/entities/commission.entity';
import { Settings } from 'libs/database/src/entities/settings.entity';
import { SettingsService } from 'apps/admin-service/src/settings/settings.service';
import { Transaction } from 'libs/database/src/entities/transactions.entity';
import { RazorpayPaymentService } from 'libs/common/src/payments/razorpay.service';
import { PaypalPaymentService } from 'libs/common/src/payments/paypal.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
          Course,
          Tax, 
          Enrollment,
          User,
          Admin,
          ApprovalQueue,
          Transaction,
          Commission,
          Settings
    ]),
    PaginationModule,
    //UploadsModule,
    AwsUploadsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const secret = configService.get<string>('JWT_SECRET') || 'dynamics365-secret-key';
            const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '7d') as import('ms').StringValue;
            return {
              secret,
              signOptions: {
                expiresIn,
              },
            };
          },
        }),
    AppMailerModule,
  ],
  providers: [EnrollmentService, StripePaymentService, RazorpayPaymentService, PaypalPaymentService, SettingsService, JwtStrategy, CommissionHelper],
  controllers: [EnrollmentController],
  exports: [EnrollmentService, CommissionHelper],
})
export class EnrollmentModule {}
