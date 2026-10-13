import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from 'libs/database/src/entities/emailtemplate.entity';

@Injectable()
export class MailHelper {
  constructor( private readonly mailerService: MailerService, @InjectRepository(EmailTemplate) private readonly emailTemplateRepository: Repository<EmailTemplate>) {}

  async sendTemplateMail(
    templateKey: string,
    to: string,
    replacements: Record<string, string | number>,
  ) {
    const template = await this.emailTemplateRepository.findOne({
      where: { key: templateKey, softDel: false },
    });

    if (!template) throw new NotFoundException(`Email template "${templateKey}" not found`);

    let body = template.body || '';
    let subject = template.subject || '';

    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, String(value));
      subject = subject.replace(regex, String(value));
    }

    await this.mailerService.sendMail({
      to,
      subject,
      html: body,
    });
  }
}
