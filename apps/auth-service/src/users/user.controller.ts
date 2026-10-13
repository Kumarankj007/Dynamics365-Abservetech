import { Body, Controller, Post, Get, Patch, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserRegisterDto, UserLoginDto, UserUpdateDto, GoogleAuthDto, MicrosoftAuthDto, ForgotPasswordDto, UserRoleSwitchDto, ResetPasswordDto, ChangePasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { UploadService } from 'libs/common/src/uploads/local/uploads.service';
import { Roles, CurrentUser } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('User Authentication')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService
) {}

  @Post('register')
        @ApiOperation({ summary: 'Register User' })
            async register(@Body() dto: UserRegisterDto) {
                return this.userService.register(dto);
            }

  @Post('google')
        @ApiOperation({ summary: 'Continue with Google' })
           async continueWithGoogle(@Body() dto: GoogleAuthDto) {
                return this.userService.continueWithGoogle(dto.accessToken!);
            }

  @Post('microsoft')
        @ApiOperation({ summary: 'Continue with Microsoft' })
            async microsoftAuth(@Body() dto: MicrosoftAuthDto) {
                return this.userService.continueWithMicrosoft(dto.accessToken!);
            }


  @Post('login')
        @ApiOperation({ summary: 'Login User' })
            async login(@Body() dto: UserLoginDto) {
                return this.userService.login(dto);
            }

  @Post('forgot-password')
        @ApiOperation({ summary: 'Forgot Password' })
            async forgotPassword(@Body() dto: ForgotPasswordDto) {
                return this.userService.forgotPassword(dto);
            }

  @Post('reset-password')
        @ApiOperation({ summary: 'Reset password using token' })
            async resetPassword(@Body() dto: ResetPasswordDto) {
                return this.userService.resetPassword(dto);
            }

  @Put('change-password')
        @ApiOperation({ summary: 'Change user password' })
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR)
            async changePassword(@CurrentUser() user: { userId: string }, @Body() dto: ChangePasswordDto) {
                return this.userService.changePassword(user.userId, dto);
            }


 @Get('profile')
        @ApiOperation({ summary: 'User Profile' })
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR)
            async profile(@CurrentUser() user: { userId: string }) {
                return this.userService.profile(user.userId);
            }

  @Put('update')
        @ApiOperation({ summary: 'Update User' })
        @ApiConsumes('multipart/form-data')
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR)
        @UseInterceptors(FileInterceptor('profile'))
            async update(@CurrentUser() user: { userId: string }, @Body() dto: UserUpdateDto, @UploadedFile() file: Express.Multer.File) {
              if (file) dto.profile = this.uploadService.getUploadPath(file.filename);
              return this.userService.update(user.userId, dto);
            }
            
  @Patch('switch-role')
        @ApiOperation({ summary: 'Switch current role for logged-in user' })
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR)
        async switchRole( @CurrentUser() user: { userId: string }, @Body() dto: UserRoleSwitchDto) {
            return this.userService.switchRole(user.userId, dto.newRole!);
        }
 
  @Delete('delete')
        @ApiOperation({ summary: 'Delete User' })
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR)
            async delete(@CurrentUser() user: { userId: string }) {
              return this.userService.delete(user.userId);
            }
}
