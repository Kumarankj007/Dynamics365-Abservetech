import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AdminRegisterDto {
  @ApiProperty({ example: 'Admin' })
  @IsNotEmpty()
  name?: string;
  
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password?: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  phoneCode?: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  phoneNumber?: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  password?: string;
}

export class AdminUpdateDto {
  @ApiProperty({ example: 'Admin', required: false })
  @IsOptional()
  @IsString()
  name?: string;
  
  @ApiProperty({ example: 'admin@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Upload an profile file' })
  @IsOptional()
  profile?: any;

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: '+91', required: false })
  @IsOptional()
  @IsString()
  phoneCode?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Platform Administrator', required: false, description: 'Professional title shown on course pages' })
  @IsOptional()
  @IsString()
  professionalTitle?: string;

  @ApiProperty({ example: 'Experienced education technology administrator', required: false, description: 'Short bio or description shown on course pages' })
  @IsOptional()
  @IsString()
  bio?: string;
}
