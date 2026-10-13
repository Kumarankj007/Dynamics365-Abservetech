import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RevenuePaginationDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  limit?: number;
}
