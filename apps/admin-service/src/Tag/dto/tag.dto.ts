import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'AI', description: 'Tag name' })
  @IsNotEmpty()
  @IsString()
  tag?: string;
}

export class UpdateTagDto {
  @ApiProperty({ example: 'AI', required: false, description: 'Updated tag name' })
  @IsOptional()
  @IsString()
  tag?: string;
}