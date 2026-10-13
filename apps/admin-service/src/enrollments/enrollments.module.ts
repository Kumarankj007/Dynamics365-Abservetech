import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Enrollment, Course, User]),
    PaginationModule,
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
  ],
  providers: [EnrollmentsService, JwtStrategy],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
