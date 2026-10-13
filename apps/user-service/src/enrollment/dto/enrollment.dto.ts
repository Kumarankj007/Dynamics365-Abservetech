import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, MaxLength, Min, Max, IsOptional, IsUUID, ValidateNested, IsNumber  } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PricingOption, PaymentMethod } from 'libs/access/src/enums/course.enum';

export class FareEstimateDto {
  @ApiProperty({ description: 'Course ID for which fare estimation is needed', example: 'c9c74e0a-4e5b-4a97-ac32-b50cd6990a5d' })
  @IsUUID()
  @IsNotEmpty()
  courseId?: string;

  @ApiProperty({ description: 'Selected pricing option (duration)', enum: PricingOption, example: PricingOption.SIX_MONTHS })
  @IsEnum(PricingOption)
  @IsNotEmpty()
  pricingOption?: PricingOption;
}

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'courseId', example: '47rfher7ew6f843fsf'})
  @IsString()
  courseId?: string


  @ApiProperty({ enum: PricingOption, example: PricingOption.SIX_MONTHS })
  @IsEnum(PricingOption)
  planType!: PricingOption;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.STRIPE;
}

export class CheckRazorpayPaymentDto {
  @ApiProperty({ description: 'Razorpay Order ID' })
  @IsString()
  razorpayOrderId!: string;

  @ApiProperty({ description: 'Razorpay Payment ID returned by checkout' })
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ description: 'HMAC signature returned by checkout' })
  @IsString()
  razorpaySignature!: string;

  @ApiProperty({ description: 'Internal Enrollment ID' })
  @IsString()
  enrollmentId!: string;
}

export class CheckPaypalPaymentDto {
  @ApiProperty({ description: 'PayPal Order ID returned by checkout' })
  @IsString()
  paypalOrderId!: string;

  @ApiProperty({ description: 'Internal Enrollment ID' })
  @IsString()
  enrollmentId!: string;
}

export class AdminGrantAccessDto {
  @ApiProperty({ description: 'User ID to grant access to', example: 'd7c9d3b4-5f12-4b8e-a7e6-8e9c12345678' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Course ID for which access is being granted', example: 'c9c74e0a-4e5b-4a97-ac32-b50cd6990a5d' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}

export class CheckPaymentStatusDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID to verify payment status', example: 'pi_3Px5RYSH6vq4v9dQ0fT2oFjw' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;

  @ApiProperty({ description: 'Enrollment ID associated with the payment', example: 'd7c9d3b4-5f12-4b8e-a7e6-8e9c12345678'})
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;
}

export class UpdateProgressDto {
  @ApiProperty({ description: 'Enrollment ID for which progress is being updated', example: 'aca0c7d1-e058-4502-b889-d107f1234567'})
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;

  @ApiProperty({ description: 'New progress percentage (0 - 100)', example: 75 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress!: number;
}


