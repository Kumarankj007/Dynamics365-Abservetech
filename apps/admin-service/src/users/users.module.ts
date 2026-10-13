import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User } from 'libs/database/src/entities/user.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { AppMailerModule } from 'libs/common/src/utils/mail/mailer.module';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 
import { CourseModule } from '../course/course.module';
import { Course } from 'libs/database/src/entities/course.entity';

@Module({
  imports: [
    CourseModule,
    TypeOrmModule.forFeature([User, Course]),
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
    AppMailerModule,
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
