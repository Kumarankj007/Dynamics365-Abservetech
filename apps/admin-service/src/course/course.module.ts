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
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 
import { User } from 'libs/database/src/entities/user.entity';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { Admin } from 'libs/database/src/entities/admin.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Course,
      CourseReview,
      Category,
      SubCategory,
      DurationBand,
      Enrollment,
      Tag,
      User,
      Admin
    ]),
    PaginationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'dynamics365-secret-key';
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '7d') as import('ms').StringValue;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [CourseService, JwtStrategy],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
