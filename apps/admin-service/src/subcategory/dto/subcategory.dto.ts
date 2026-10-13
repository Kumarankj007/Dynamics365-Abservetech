import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ example: 'Development' })
  @IsNotEmpty()
  @IsString()
  subcategory?: string;

  @ApiProperty({ example: 'Courses related to software development', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'c1a4a6f3-2b32-47f8-9f2e-3b5a0d7f7cde', required: false, description: 'UUID of the parent category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateSubCategoryDto {
  @ApiProperty({ example: 'Web Development', required: false })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({ example: 'Updated description about software and web development', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'c1a4a6f3-2b32-47f8-9f2e-3b5a0d7f7cde', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

}
