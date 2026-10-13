import { IsEmail, IsInt, IsOptional, IsString, IsBoolean, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({
    example: 'Jon Snow',
    description: 'Full name of the student',
  })
  @IsNotEmpty()
  @IsString()
  fullname?: string;

  @ApiProperty({
    example: 'jonsnow@gmail.com',
    description: 'Email address of the student (must be unique)',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '123456',
    required: false,
    description: 'Password for the student (optional if invitation email is sent)',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'If true, sends an invitation email with auto-generated password or link instead of requiring manual password input',
  })
  @IsOptional()
  @IsBoolean()
  sendInvitationEmail?: boolean;
}

export class GetUsersFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status: active/inactive', enum: ['active','inactive'] })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: 'Filter by signup time', enum: ['all','thisMonth','lastMonth','last3Months'] })
  @IsOptional()
  @IsString()
  timeRange?: 'all' | 'thisMonth' | 'lastMonth' | 'last3Months';

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
  
}

export class GetInstructorsFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status: active/inactive', enum: ['active','inactive'] })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: 'Filter by signup time', enum: ['all','thisMonth','lastMonth','last3Months'] })
  @IsOptional()
  @IsString()
  timeRange?: 'all' | 'thisMonth' | 'lastMonth' | 'last3Months';

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
  
}