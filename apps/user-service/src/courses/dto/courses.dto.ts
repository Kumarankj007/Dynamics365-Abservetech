import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, MaxLength, IsOptional, IsUUID, ValidateNested, IsNumber, Min, Max  } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Status, ApproximateDuration, PricingOption, ContentType, AttachmentFileType } from 'libs/access/src/enums/course.enum';

export class CreateTitleDto {
  @ApiProperty({ example: 'Master Power BI Dashboard Creation' })
  @IsNotEmpty()
  @IsString()
  title?: string;
}

export class AddLearningOutcomesDto {
  @ApiProperty({ type: [String], example: ['Outcome 1', 'Outcome 2'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10) 
  @IsString({ each: true })
  outcomes?: string[];
}

export class AddCourseDescriptionDto {
  @ApiProperty({ 
    description: 'Write a compelling course description that highlights what students will learn and achieve',
    example: 'Master the Power Platform with this complete course covering Canvas apps, Model-Driven apps, and Dataverse',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Description must not exceed 500 characters.' })
  description?: string;

  @ApiProperty({
    description: 'Estimated total duration to complete the course.',
    example: 'b3d9d2c2-8b4f-4b91-9e9b-1e25a3c4d8f2',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Duration ID is required.' })
  approximateDuration?: string;

  @ApiProperty({
    description: 'Category ID (UUID) representing the Microsoft Dynamics 365 area.',
    example: 'b3d9d2c2-8b4f-4b91-9e9b-1e25a3c4d8f2',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Category ID is required.' })
  categoryId?: string;

  @ApiProperty({
    description: 'Sub Category ID (UUID) representing the Microsoft Dynamics 365 area.',
    example: 'b3d9d2c2-8b4f-4b91-9e9b-1e25a3c4d8f2',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Sub Category ID is required.' })
  subCategoryId?: string;

 @ApiPropertyOptional({
    type: [String],
    description: 'Suggested tags (UUID array)',
    example: ['1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6']
  })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  suggestedTags?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Custom tags added by the creator.',
    example: ['FinanceAutomation', 'RealWorldScenarios'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  customTags?: string[];
}

export class LectureAttachmentDto {
  @ApiProperty({ example: 'Power BI Dataset.pdf' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'https://bucket.s3.region.amazonaws.com/course-attachments/file.pdf'})
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiProperty({ enum: AttachmentFileType, example: AttachmentFileType.PDF})
  @IsEnum(AttachmentFileType)
  fileType!: AttachmentFileType;

  @ApiPropertyOptional({ example: 245678 })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiPropertyOptional({ example: '2026-01-28T10:30:00Z' })
  @IsOptional()
  uploadedAt?: Date;
}



export class AddCourseLectureDto {
  @ApiProperty({ description: 'Lecture title', example: 'Lecture 1: Introduction to Power BI' })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ description: 'Content type for the lecture (UPLOAD_VIDEO or EXTERNAL_LINK)', enum: ContentType, example: ContentType.UPLOAD_VIDEO })
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ description: 'Uploaded video file URL (for UPLOAD_VIDEO)', example: 'https://bucket.s3.region.amazonaws.com/video.mp4' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'External video URL (for EXTERNAL_LINK)', example: 'https://youtube.com/watch?v=abcd1234' })
  @IsOptional()
  @Transform(({ value }) => { if (!value) return value; const match = value.match(/src\s*=\s*["']([^"']+)["']/); return match ? match[1] : value.trim() })
  @IsString()
  videoUrl?: string;

  @ApiProperty({ description: 'Duration Time', example: 5.5 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Supporting documents for this lecture', type: [LectureAttachmentDto]})
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LectureAttachmentDto)
  @IsArray()
  attachments?: LectureAttachmentDto[];
}

export class AddCourseModuleDto {
  @ApiProperty({ description: 'Module title', example: 'Module 1: Getting Started with Power BI' })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Optional module description', example: 'This module gives an overview of Power BI setup and basics.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Lectures under this module', type: [AddCourseLectureDto] })
  @ValidateNested({ each: true })
  @Type(() => AddCourseLectureDto)
  @IsArray()
  lectures?: AddCourseLectureDto[];
}

export class AddCourseCurriculumDto {
  @ApiProperty({ description: 'Modules to add', type: [AddCourseModuleDto] })
  @ValidateNested({ each: true })
  @Type(() => AddCourseModuleDto)
  @IsArray()
  modules?: AddCourseModuleDto[];
}

export class AddCoursePricingOptionDto {
  @ApiProperty({ enum: PricingOption, description: 'Pricing option for the course', example: PricingOption.ONE_YEAR })
  @IsEnum(PricingOption)
  option?: PricingOption;

  @ApiProperty({ description: 'Price in USD', example: 129 })
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Optional description for the pricing option', example: 'Full year to complete' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Stripe Price ID (optional, auto-generated)', example: 'price_1P6XYZabc123', required: false })
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiProperty({ description: 'Razorpay Plan ID (optional, auto-generated)', example: 'plan_1P6XYZabc123', required: false })
  @IsOptional()
  @IsString()
  razorpayPlanId?: string;

  @ApiProperty({ description: 'PayPal Plan ID (optional, auto-generated)', example: 'P-5ML4271244454362WXNWU5NQ', required: false })
  @IsOptional()
  @IsString()
  paypalPlanId?: string;
}

export class AddCoursePricingDto {
  @ApiProperty({ description: 'Intro video URL uploaded via upload-lecture-video API', example: 'https://abserve-video-storage.s3.eu-north-1.amazonaws.com/course-intros/intro-video.mp4', required: false})
  @IsOptional()
  @IsString()
  introVideoUrl?: string;

  @ApiProperty({ description: 'Duration of Intro video', example: 2 })
  @IsOptional()
  @IsNumber()
  introDuration?: number;

  @ApiProperty({ description: 'Pricing options for the course', type: [AddCoursePricingOptionDto], example: [{ option: 'BASIC', price: 499, description: 'Access to 10 lectures' },{ option: 'PREMIUM', price: 899, description: 'Access to all modules' }] })
  @ValidateNested({ each: true })
  @Type(() => AddCoursePricingOptionDto)
  @IsArray()
  pricingOptions?: AddCoursePricingOptionDto[];
}

export class UploadLectureVideoDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Lecture video file (MP4, MOV, MKV, etc.)' })
  lectureFiles?: any; 
}

export class UploadLectureAttachmentDto {
  @ApiProperty({ type: 'object', properties: { attachment: { type: 'string', format: 'binary'}} })
  attachment?: any; 
}

export class CreateCourseReviewDto {
  @ApiProperty({ description: 'Course ID to which the review belongs', example: 'd6d03a70-55fc-4e29-af55-2ac25d5c4d1e' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ description: 'Enrollment ID if review is only allowed after purchase', example: 'e729a6bf-8bfc-469c-a27d-10cb433e861d' })
  @IsUUID()
  @IsOptional()
  enrollmentId?: string;

  @ApiPropertyOptional({ description: 'Optional short title for the review', example: 'Excellent course for beginners!', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed review content', example: 'The course was very informative and well structured.' })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({ description: 'Rating from 1 to 5 stars', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;
}

export class CreateInstructorReplyDto {
  @ApiProperty({ example: 'Thank you for your feedback!' })
  @IsString()
  @IsNotEmpty()
  response!: string;
}

