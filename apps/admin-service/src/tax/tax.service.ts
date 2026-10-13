import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from 'libs/database/src/entities/tax.entity';
import { CreateTaxDto, UpdateTaxDto } from './dto/tax.dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

 
  async create(dto: CreateTaxDto) {
    try {
      const existing = await this.taxRepository.findOne({ where: {} });
      if (existing) throw new BadRequestException('A tax record already exists');

      const newTax = this.taxRepository.create({ tax: Number(dto.tax) });

      const savedTax = await this.taxRepository.save(newTax);

      return {
        status: true,
        statusCode: 201,
        message: 'Tax successfully created',
        data: savedTax,
      };
    } catch (error: any) {
        console.error('Create Tax Error:', error);
        if ( error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async getTax() {
    try {
      const tax = await this.taxRepository.findOne({ where: {} });
      if (!tax) throw new NotFoundException('No tax record found');

      return {
        status: true,
        statusCode: 200,
        message: 'Tax fetched successfully',
        data: tax,
      };
    } catch (error: any) {
        console.error('Get Tax Error:', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async update(dto: UpdateTaxDto) {
    try {
      const tax = await this.taxRepository.findOne({ where: { } });
      if (!tax) throw new NotFoundException('Tax record not found');

      tax.tax = dto.tax ? Number(dto.tax) : tax.tax;

      const updatedTax = await this.taxRepository.save(tax);

      return {
        status: true,
        statusCode: 200,
        message: 'Tax updated successfully',
        data: updatedTax,
      };
    } catch (error: any) {
        console.error('Update Tax Error:', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }
}
