import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Development' })
  @IsNotEmpty()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Courses related to software development', required: false })
  @IsOptional()
  @IsString()
  description?: string;

}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Development', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Courses related to software development', required: false })
  @IsOptional()
  @IsString()
  description?: string;

}
