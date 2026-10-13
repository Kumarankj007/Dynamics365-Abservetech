import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, MinLength, Matches } from 'class-validator';
import { Role } from 'libs/access/src/enums/roles.enum';

export class UserRegisterDto {
  @ApiProperty({ example: 'Jon snow' })
  @IsNotEmpty()
  @IsString()
  fullname?: string;
  
  @ApiProperty({ example: 'jonsnow@gmail.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
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

  @ApiProperty({ example: Role.USER, enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserLoginDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  password?: string;
}

export class UserUpdateDto {
  @ApiPropertyOptional({ example: 'Jon snow',required: false })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false, description: 'Upload an profile file' })
  @IsOptional()
  profile?: any;

  @ApiPropertyOptional({ example: '+91', required: false })
  @IsOptional()
  @IsString()
  phoneCode?: string;

  @ApiPropertyOptional({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Senior Dynamics 365 Consultant', required: false })
  @IsOptional()
  @IsString()
  professionalTitle?: string;

  @ApiPropertyOptional({ example: 'New York, USA', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://jonsnow.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Experienced consultant in Dynamics 365...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: '5 years', required: false })
  @IsOptional()
  @IsString()
  yearsOfExperience?: string;

  @ApiPropertyOptional({ example: ['Java', 'Python'], required: false, isArray: true })
  @IsOptional()
  areasOfExpertise?: string[];
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...'})
  @IsNotEmpty()
  @IsString()
  accessToken?: string;
}

export class MicrosoftAuthDto {
  @ApiProperty({ description: 'Microsoft Access Token', example: 'eyJ0eXAiOiJKV1QiLCJub25jZ...' })
  @IsNotEmpty()
  @IsString()
  accessToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'stark@gmail.com' })
  @IsEmail()
  email?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from email', example: 'eyJhbGciOiJIUzI1...' })
  @IsNotEmpty()
  @IsString()
  token?: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  newPassword?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Enter current password', example: '123456' })
  @IsString()
  @IsNotEmpty()
  currentPassword?: string;

  @ApiProperty({ description: 'Enter New Password', example: 'Nivetha@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])/, { message: 'New password must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'New password must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'New password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'New password must contain at least one special character (@$!%*?&)' })
  newPassword?: string;

  @ApiProperty({ description: 'Confirm new password', example: 'Nivetha@123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword?: string;
}

export class UserRoleSwitchDto {
  @ApiProperty({
    description: 'The new role the user wants to switch to',
    example: Role.INSTRUCTOR,
    enum: Role,
  })
  @IsEnum(Role, { message: 'Invalid role type' })
  @IsNotEmpty({ message: 'Role is required' })
  newRole?: Role;
}
