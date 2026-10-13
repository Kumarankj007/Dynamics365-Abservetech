import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommissionDto {
  @ApiProperty({ example: 30.00, description: 'Default Platform Share' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  platformShareDefault?: number;

  @ApiProperty({ example: 70.00, description: 'Default Instructor Share' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  instructorShareDefault?: number;

  @ApiProperty({ example: '2025-11-05', description: 'Effective from date' })
  @IsNotEmpty()
  @IsDateString()
  effectiveFrom?: Date;
}

export class UpdateCommissionDto {
  @ApiProperty({ example: 35.00, description: 'Default Platform Share', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  platformShareDefault?: number;

  @ApiProperty({ example: 65.00, description: 'Default Instructor Share', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  instructorShareDefault?: number;

  @ApiProperty({ example: '2025-12-01', description: 'Effective from date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}

export class PremiumInstructorOverrideDto {
  @ApiProperty({ example: 'instructor-uuid', description: 'Instructor Id' })
  @IsNotEmpty()
  instructorId?: string;

  @ApiProperty({ example: 25.00, description: 'Platform share' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  platformShare?: number;

  @ApiProperty({ example: 75.00, description: 'Instructor  share' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  instructorShare?: number;

  @ApiProperty({ example: '2025-01-15', description: 'Effective from date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}

export class UpdateOverrideDto {
  @ApiProperty({ example: 35.00, description: 'Default Platform Share', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  platformShare?: number;

  @ApiProperty({ example: 65.00, description: 'Default Instructor Share', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  instructorShare?: number;

  @ApiProperty({ example: '2025-12-01', description: 'Effective from date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}
