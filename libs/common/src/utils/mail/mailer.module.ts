import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from 'libs/database/src/entities/emailtemplate.entity';
import { SettingsModule } from 'apps/admin-service/src/settings/settings.module';
import { SettingsService } from 'apps/admin-service/src/settings/settings.service';
import { MailHelper } from './mailer.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    SettingsModule, 
    MailerModule.forRootAsync({
      imports: [SettingsModule],
      inject: [SettingsService],
      useFactory: async (settingsService: SettingsService) => {
        const smtp = await settingsService.getSmtp();

        if (!smtp) {
          throw new Error('SMTP settings not found');
        }

        return {
          transport: {
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure ?? false,
            auth: {
              user: smtp.user,
              pass: smtp.pass,
            },
            tls: {
              rejectUnauthorized: false
            },
          },
          defaults: {
            from: `"Dynamics365" <${smtp.user}>`,
          },
        };
      },
    }),
  ],
  providers: [MailHelper],
  exports: [MailHelper],
})
export class AppMailerModule {}
