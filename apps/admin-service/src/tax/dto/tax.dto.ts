import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxDto {
  @ApiProperty({ example: 12.35, description: 'Tax Percentage' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tax must be a number' })
  tax?: number;
}

export class UpdateTaxDto {
  @ApiProperty({ example: 15.25, required: false, description: 'Tax Percentage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tax must be a number' })
  tax?: number;
}
