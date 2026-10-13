import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Status, ReviewStatus } from 'libs/access/src/enums/course.enum';

export class CourseApprovalDto {
  @ApiProperty({ example: Status.PUBLISHED, description: 'Updated status of the course', enum: Status })
  @IsEnum(Status)
  status?: Status;
}

export class CreateAdminReplyDto {
  @ApiProperty({ example: 'Thank you for your feedback!' })
  @IsString()
  @IsNotEmpty()
  response!: string;
}

export class EditReviewDto {
  @ApiProperty({ example: 'Updated review title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated full review text', required: false })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: Status.PUBLISHED, description: 'Updated status of the review', enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}

