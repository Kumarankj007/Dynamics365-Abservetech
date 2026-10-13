import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Course } from 'libs/database/src/entities/course.entity';
import { CourseReview } from 'libs/database/src/entities/course-review.entity';
import { Category } from 'libs/database/src/entities/category.entity';
import { SubCategory } from 'libs/database/src/entities/subcategory.entity';
import { DurationBand } from 'libs/database/src/entities/durationband.entity';
import { Tag } from 'libs/database/src/entities/tags.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { StripePaymentService } from 'libs/common/src/payments/stripe.service';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { AppMailerModule } from 'libs/common/src/utils/mail/mailer.module';
import { UploadsModule } from 'libs/common/src/uploads/local/uploads.module';
import { AwsUploadsModule } from 'libs/common/src/uploads/aws/aws-uploads.module'
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { Settings } from 'libs/database/src/entities/settings.entity';
import { RazorpayPaymentService } from 'libs/common/src/payments/razorpay.service';
import { PaypalPaymentService } from 'libs/common/src/payments/paypal.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
          Course,
          CourseReview,
          Category,
          SubCategory,
          DurationBand,
          Tag,
          Enrollment,
          User,
          Admin,
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
    AppMailerModule
  ],
  providers: [CourseService, JwtStrategy, StripePaymentService, RazorpayPaymentService, PaypalPaymentService ],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
