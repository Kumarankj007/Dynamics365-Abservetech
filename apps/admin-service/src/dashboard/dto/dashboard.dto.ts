import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsISO8601 } from 'class-validator';

export enum DashboardRange {
  LIFETIME = 'LIFETIME',
  THIS_MONTH = 'THIS_MONTH',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  YTD = 'YTD',
  CUSTOM = 'CUSTOM',
}

export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: DashboardRange, description: 'Predefined range filter' })
  @IsOptional()
  @IsEnum(DashboardRange)
  range?: DashboardRange = DashboardRange.LIFETIME;

  @ApiPropertyOptional({ description: 'Custom range start (ISO date), required if range=CUSTOM', example: '2025-01-01' })
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Custom range end (ISO date), required if range=CUSTOM', example: '2025-06-30' })
  @IsOptional()
  @IsISO8601()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number for monthly revenue', example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of months per page', example: 6 })
  @IsOptional()
  limit?: number = 6;
}
