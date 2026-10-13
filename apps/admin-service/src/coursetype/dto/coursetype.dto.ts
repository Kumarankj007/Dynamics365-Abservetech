import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseTypeDto {
  @ApiProperty({ example: 'Course' })
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Create rich learning experiences with video lectures, quizzes, etc.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Upload an icon file' })
  @IsOptional()
  icon?: any;
}

export class UpdateCourseTypeDto {
  @ApiProperty({ example: 'Practice Test', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Help students prepare for certification exams with practice tests', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Upload an icon file' })
  @IsOptional()
  icon?: any;
}
