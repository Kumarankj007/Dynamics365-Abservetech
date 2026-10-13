import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateDurationBandDto {
  @ApiProperty({ example: '20 – 50 hours', description: 'Label for the duration band' })
  @IsNotEmpty()
  @IsString()
  label?: string;
}

export class UpdateDurationBandDto {
  @ApiProperty({ example: '50+ hours', required: false, description: 'Updated label for the duration band' })
  @IsOptional()
  @IsString()
  label?: string;
}