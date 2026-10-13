import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { google } from 'googleapis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailHelper } from 'libs/common/src/utils/mail/mailer.helper';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { Role } from 'libs/access/src/enums/roles.enum';
import { UserRegisterDto, UserLoginDto, UserUpdateDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto  } from './dto/user.dto';

@Injectable()
export class UserService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly jwtService: JwtService,
    private readonly mailHelper: MailHelper
  ) {}

  async register(dto: UserRegisterDto) {
    try {
        const existing = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existing) throw new BadRequestException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password!, 10);

        const userRole = dto.role || Role.USER;

        const user = this.userRepository.create({
          fullname: dto.fullname,
          email: dto.email,
          password: hashedPassword,
          phoneCode: dto.phoneCode,
          phoneNumber: dto.phoneNumber,
          role: [userRole], 
          currentRole: userRole,
          walletBalance: 0
        });

        const newUser = await this.userRepository.save(user);

        const payload = { sub: user.id, email: user.email, role: user.role, currentRole: user.currentRole, };
        const token = await this.jwtService.signAsync(payload)
        

        await this.mailHelper.sendTemplateMail('USER_REGISTRATION', user.email!, {
        name: user.fullname || 'User',
        email: user.email!
      });

        return {
          status: true,
          statusCode: 201,
          message: 'User successfully created',
          data: { newUser, token },
        };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message); 
    }
  }
  
  async continueWithGoogle(accessToken: string) {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new BadRequestException(`Failed to fetch Google user info: ${errText}`);
      }

      const userInfo = await response.json();
      console.log("Google user info:", userInfo);

      const { email, name, id: googleId, verified_email, picture } = userInfo;

      if (!email) {
        throw new BadRequestException("Google account missing email");
      }

      // ✅ Step 2. Check if user exists in DB
      let user = await this.userRepository.findOne({ where: { email } });

      // ✅ Step 3. If new user, create an account
      if (!user) {
        user = this.userRepository.create({
          fullname: name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim(),
          email,
          password: googleId, // optional placeholder since Google users don’t use passwords
          role: [Role.USER],
          // profileImage: picture || null,
          // verified: verified_email || true,
        });

        await this.userRepository.save(user);
      }

      // ✅ Step 4. Create JWT for your system
      const jwt = this.jwtService.sign({ 
        sub: user.id, email: user.email, role: user.role, currentRole: user.currentRole
       });

      // ✅ Step 5. Return response
      return {
        status: true,
        statusCode: 200,
        message: "Google sign-in successful",
        accessToken: jwt,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          //picture: user.profileImage,
        },
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async continueWithMicrosoft(accessToken: string) {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = response.data;
      if (!profile || !profile.mail) {
        throw new BadRequestException('Invalid Microsoft token or missing email');
      }

      const email = profile.mail || profile.userPrincipalName;
      const fullname = profile.displayName;
      const sub = profile.id;

      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        user = this.userRepository.create({
          fullname,
          email,
          password: sub,
          role: [Role.USER],
        });
        await this.userRepository.save(user);
      }

      const jwt = this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Microsoft sign-in successful',
        accessToken: jwt,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async login(dto: UserLoginDto) {
    try {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await bcrypt.compare(dto.password!, user.password!);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, email: user.email, role: user.role, currentRole: user.currentRole, };
        const token = await this.jwtService.signAsync(payload);

        const courseCount = await this.courseRepository.count({ where: { creatorId: user.id } });

        return {
          status: true,
          statusCode: 200,
          message: 'User successfully logged in',
          data: { user, token, courseCount },
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message); 
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.userRepository.findOne({ where: { email: dto.email } });
      if (!user) throw new NotFoundException('User not found with this email');

      const token = await this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        { secret: process.env.JWT_RESET_SECRET, expiresIn: '15m' },
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset_password/?token=${token}`;

      console.log('Password reset link:', resetLink); // For debugging purposes

      await this.mailHelper.sendTemplateMail('RESET_PASSWORD', user.email!, {
        name: user.fullname || 'User',
        resetLink,
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Password reset link sent to your email',
      };
    } catch (error: any) {
      console.log("---------error", error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
  try {
    const payload = await this.jwtService.verifyAsync(dto.token!, {
      secret: process.env.JWT_RESET_SECRET,
    });

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.newPassword!, 10);

    await this.userRepository.update(user.id!, { password: hashedPassword });

    return {
      status: true,
      statusCode: 200,
      message: 'Password reset successfully',
    };
  } catch (error: any) {
      console.log("---------error", error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
  }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const isMatch = await bcrypt.compare(dto.currentPassword!, user.password!);
      if (!isMatch) throw new BadRequestException('Current password is incorrect');

      if (dto.newPassword !== dto.confirmPassword) {
         throw new BadRequestException('New password and confirm password do not match');
      }
      
      const hashedPassword = await bcrypt.hash(dto.newPassword!, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);

      return { 
        status: true,
        statusCode: 200,
        message: 'Password changed successfully'
      };

    } catch (error: any) {
      console.log("---------error", error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async profile(userId: string) {
    try {
        const user = await this.userRepository.findOne({
          where: { id: userId, softDel: false },
        });

        if (!user) throw new NotFoundException('User not found');

        return {
          status: true,
          statusCode: 200,
          message: 'User profile fetched',
          data: user,
        };
    } catch (error: any) {
      console.log("---------error", error)
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  } 

  async update(userId: string, dto: UserUpdateDto, profile?: Express.Multer.File) {
    try {
      console.log('-------dto', dto);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

    if (dto.areasOfExpertise) {
      const expertise = dto.areasOfExpertise as any;
    try {
    
      if (typeof expertise === 'string') {
        const parsed = JSON.parse(expertise);
        dto.areasOfExpertise = Array.isArray(parsed[0]) ? parsed[0] : parsed;
      }
    } catch {
        dto.areasOfExpertise = [expertise];
    }
   }


    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== '') {
        (user as any)[key] = value;
      }
    }

      await this.userRepository.save(user);

      const { password, ...rest } = user; 
      return {
        status: true,
        statusCode: 200,
        message: 'User successfully updated',
        data: rest,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async switchRole(userId: string, newRole: Role) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      if (!user.role!.includes(newRole)) { user.role!.push(newRole);  }

      user.currentRole = newRole;
      await this.userRepository.save(user);

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        currentRole: user.currentRole,
      };
      const token = await this.jwtService.signAsync(payload);
      console.log('-------switched user', user);
      return {
        status: true,
        message: `Role switched successfully to ${newRole}`,
        data: { user, token}

      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async delete(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      await this.userRepository.update(userId, { softDel: true });

      const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
      if (!updatedUser) throw new NotFoundException('User not found after update');

      const { password, ...rest } = updatedUser;

       await this.mailHelper.sendTemplateMail('DELETE_ACCOUNT', user.email!, {
        name: user.fullname || 'User',
        email: user.email!
      });

      return {
        status: true,
        statusCode: 200,
        message: 'User soft deleted successfully',
        data: rest,
      };
    } catch (error: any) {
        console.error('---------error', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

}
