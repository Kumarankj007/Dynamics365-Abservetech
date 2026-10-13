import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum TransactionDateRange {
  ALL_TIME = 'All Time',
  THIS_MONTH = 'This Month',
  LAST_MONTH = 'Last Month',
  LAST_3_MONTHS = 'Last 3 Months',
}
export class UserTransactionsDto {
  @ApiPropertyOptional({ description: 'Date range filter', enum: TransactionDateRange })
  @IsOptional()
  @IsEnum(TransactionDateRange)
  dateRange?: TransactionDateRange = TransactionDateRange.ALL_TIME;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  limit?: number;
}
