import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'RESET_PASSWORD', description: 'Unique key for identifying the template' })
  @IsString()
  @IsNotEmpty()
  key?: string;

  @ApiProperty({ example: 'Reset your password', description: 'Email subject line' })
  @IsString()
  @IsNotEmpty()
  subject?: string;

  @ApiProperty({ example: '<p>Hello {{name}}, click <a href="{{resetLink}}">here</a> to reset password</p>', description: 'HTML or text body of the email' })
  @IsString()
  @IsNotEmpty()
  body?: string;
}

export class UpdateEmailTemplateDto {
  @ApiProperty({ example: 'RESET_PASSWORD', description: 'Unique key for identifying the template' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ example: 'Reset your password', description: 'Email subject line' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: '<p>Hello {{name}}, click <a href="{{resetLink}}">here</a> to reset password</p>', description: 'HTML or text body of the email' })
  @IsOptional()
  @IsString()
  body?: string;
}



