import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'libs/database/src/database.module';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { AppMailerModule } from 'libs/common/src/utils/mail/mailer.module';
import { UploadsModule } from 'libs/common/src/uploads/local/uploads.module';
import { AwsUploadsModule } from 'libs/common/src/uploads/aws/aws-uploads.module'
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './users/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    DatabaseModule,
    UploadsModule,
    AwsUploadsModule,
    AdminModule,
    UserModule,
    PaginationModule,
    AppMailerModule
  ],
})
export class AuthServiceModule {}
