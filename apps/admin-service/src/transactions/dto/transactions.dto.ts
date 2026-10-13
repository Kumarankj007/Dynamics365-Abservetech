import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class TransactionsDto {
  @ApiPropertyOptional({ description: 'Start date (inclusive) in ISO format, e.g. 2025-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date (inclusive) in ISO format, e.g. 2025-01-31' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Payment source filter', enum: [ "All", "Stripe", "Razorpay", "CashApp", "Zelle", "Manual" ] })
  @IsOptional()
  @IsString()
  paymentSource?: 'All' | 'Stripe' | 'Razorpay' | "CashApp" | "Zelle" | "Manual";

  @ApiPropertyOptional({ description: 'Transaction status', enum: [ "All", "Completed", "Pending", "Failed", "Cancelled", "Declined", "Refunded" ] })
  @IsOptional()
  @IsString()
  status?: 'All' | 'Completed' | 'Pending' | 'Failed' | 'Cancelled' | 'Declined' | 'Refunded' ;

  @ApiPropertyOptional({ description: 'Renewal month filter. Format: YYYY-MM or MM (month number)' })
  @IsOptional()
  @IsString()
  renewalMonth?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Export format if requesting export', enum: ['csv','excel'] })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'excel'])
  export?: 'csv' | 'excel';
}
