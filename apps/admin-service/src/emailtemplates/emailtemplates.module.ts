import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { EmailTemplate } from 'libs/database/src/entities/emailtemplate.entity';
import { EmailTemplateService } from './emailtemplates.service';
import { EmailTemplateController } from './emailtemplate.controller';
import { PaginationModule } from 'libs/common/src/pagination/pagination.module';
import { JwtStrategy } from 'libs/access/src/strategies/jwt.strategy'; 

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EmailTemplate]),
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
  providers: [EmailTemplateService, JwtStrategy],
  controllers: [EmailTemplateController],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule {}
