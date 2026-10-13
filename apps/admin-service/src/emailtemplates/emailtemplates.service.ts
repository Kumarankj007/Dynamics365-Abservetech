import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from 'libs/database/src/entities/emailtemplate.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/emailtemplates.dto';


@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(dto: CreateEmailTemplateDto) {
    try {
      const existing = await this.emailTemplateRepository.findOne({
        where: { key: dto.key, softDel: false },
      });
      if (existing) throw new BadRequestException('Email Template already exists');

      const emailtemplate = this.emailTemplateRepository.create(dto);
      const newEmailTemplate = await this.emailTemplateRepository.save(emailtemplate);

      return {
        status: true,
        statusCode: 201,
        message: 'Email Template successfully created',
        data: newEmailTemplate,
      };
    } catch (error: any) {
       console.error('---------error', error);
       if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
       throw new InternalServerErrorException(error.message);
    }
  }

  async fetchAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const [emailtemplate, total] = await this.emailTemplateRepository.findAndCount({
        where: { softDel: false },
        select: ['id', 'key', 'subject', 'body', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (!emailtemplate.length) throw new NotFoundException('No email template found');

      return {
        status: true,
        statusCode: 200,
        message: 'All email template fetched successfully',
        data: {
          total,
          page,
          limit,
          data: emailtemplate,
        },
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async fetchOne(emailTemplateId: string) {
    try {
      const emailtemplate = await this.emailTemplateRepository.findOne({
        where: { id: emailTemplateId, softDel: false },
        select: ['id', 'key', 'subject', 'body', 'createdAt', 'updatedAt'],
      });

      if (!emailtemplate) throw new NotFoundException('Email Template not found');

      return {
        status: true,
        statusCode: 200,
        message: 'Email template fetched successfully',
        data: emailtemplate,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(emailTemplateId: string, dto: UpdateEmailTemplateDto) {
    try {
      const emailTemplate = await this.emailTemplateRepository.findOne({
        where: { id: emailTemplateId, softDel: false },
      });
      if (!emailTemplate) throw new NotFoundException('Email Template not found');

      await this.emailTemplateRepository.update(emailTemplateId, dto);
      const updatedEmailTemplate = await this.emailTemplateRepository.findOne({
        where: { id: emailTemplateId },
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Email Template successfully updated',
        data: updatedEmailTemplate,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(emailTemplateId: string) {
    try {
      const emailTemplate = await this.emailTemplateRepository.findOne({
        where: { id: emailTemplateId },
      });
      if (!emailTemplate) throw new NotFoundException('Email Template not found');

      emailTemplate.softDel = true;
      const deletedEmailTemplate = await this.emailTemplateRepository.save(emailTemplate);

      return {
        status: true,
        statusCode: 200,
        message: 'Email Template deleted successfully',
        data: deletedEmailTemplate,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
