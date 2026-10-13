import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailHelper } from 'libs/common/src/utils/mail/mailer.helper';
import { User } from 'libs/database/src/entities/user.entity';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { CreateStudentDto, GetUsersFilterDto, GetInstructorsFilterDto } from './dto/users.dto';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { Role } from 'libs/access/src/enums/roles.enum';
import { PaymentStatus, Status } from 'libs/access/src/enums/course.enum';
import { Course } from 'libs/database/src/entities/course.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly jwtService: JwtService,
    private readonly mailHelper: MailHelper   
  ) {}

async createStudent(dto: CreateStudentDto) {
  try {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    let password: string;

    if (dto.sendInvitationEmail) {
      password = Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(password, 10);

      const student = this.userRepository.create({
        fullname: dto.fullname,
        email: dto.email,
        password: hashedPassword,
        role: [Role.USER],
      });

      const newStudent = await this.userRepository.save(student);

      const token = await this.jwtService.signAsync(
        { sub: newStudent.id, email: newStudent.email },
        { secret: process.env.JWT_INVITE_SECRET, expiresIn: '24h' },
      );

      const inviteLink = `http://localhost:3000/reset_password/?token=${token}`;


      await this.mailHelper.sendTemplateMail('INVITATION_EMAIL', dto.email!, {
          name: dto.fullname!,
          inviteLink,
      });

      return {
        status: true,
        statusCode: 201,
        message: 'Student created and invitation email sent',
        data: newStudent,
      };
    }

    else if (dto.password) {
      password = await bcrypt.hash(dto.password, 10);

      const student = this.userRepository.create({
        fullname: dto.fullname,
        email: dto.email,
        password,
        role: [Role.USER],
      });

      const newStudent = await this.userRepository.save(student);

      return {
        status: true,
        statusCode: 201,
        message: 'Student created successfully',
        data: newStudent,
      };
    } else {
      throw new BadRequestException('Either password or invitation email must be provided');
    }
  } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
  }
}

async updateUserStatus(id: string, isActive: boolean) {
  try {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = isActive;
    await this.userRepository.save(user);

    return {
      status: true,
      statusCode: 200,
      message: `User has been ${isActive ? 'activated' : 'deactivated'}`,
      data: user,
    };
  } catch (error: any) {
    console.error('Error updating user status:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

async deleteUser(id: string) {
  try {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.softDel = true;
    await this.userRepository.save(user);

    return {
      status: true,
      statusCode: 200,
      message: 'User has been deleted',
      data: user,
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

async getAllUsers(filterDto: GetUsersFilterDto, pagination: PaginationDto) {
  const { search, status, timeRange } = filterDto;
  const { page = 1, limit = 10 } = pagination;

  const query = this.userRepository.createQueryBuilder('user')
    .where('user.softDel = :softDel', { softDel: false });

  if (search) {
    query.andWhere('(user.fullname ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
  }

  if (status) {
    const isActive = status === 'active';
    query.andWhere('user.isActive = :isActive', { isActive });
  }

  if (timeRange && timeRange !== 'all') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        startDate = new Date(0);
        endDate = now;
    }

    query.andWhere('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
  }

  query
    .leftJoin(
      'enrollments',
      'enrollment', 
      'enrollment."userId" = user.id AND enrollment.softDel = false'
    )
    .addSelect('COUNT(enrollment.id)', 'enrollmentsCount')
    .groupBy('user.id')
    .orderBy('user.createdAt', 'DESC')
    .offset((page - 1) * limit)
    .limit(limit);

  const rawUsers = await query.getRawAndEntities();

  // rawUsers.raw contains enrollmentsCount from the COUNT
  const usersWithCount = rawUsers.entities.map((u, idx) => ({
    id: u.id,
    fullname: u.fullname,
    email: u.email,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    enrollmentsCount: parseInt(rawUsers.raw[idx].enrollmentsCount, 10) || 0,
  }));

  const total = await this.userRepository.count({ where: { softDel: false } });

  return {
    status: true,
    statusCode: 200,
    message: 'Users fetched successfully',
    data: {
      total,
      page,
      limit,
      data: usersWithCount,
    },
  };
}

async getAllUserswithCourses() {
  try {
    const [users, courses] = await Promise.all([
      this.userRepository.find({
        where: { softDel: false, isActive: true }
      }),
      this.courseRepository.find({
        where: { softDel: false, status: Status.PUBLISHED }
      })
    ])

    return {
      status: true,
      statusCode: 200,
      message: 'Users with courses fetched successfully',
      data: { users, courses }
    }
  } catch (error: any) {
    console.error('Error getting user:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
    
  }
}

async getUserById(id: string) {
  try {
        const user = await this.userRepository.findOne({
        where: { id, softDel: false },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return {
        status: true,
        statusCode: 200,
        message: 'User fetched successfully',
        data: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          profile: user.profile,
          phoneCode: user.phoneCode,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
  } catch (error: any) {
    console.error('Error getting user:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

async resetUserPassword(id: string, newPassword: string) {
  try {
      const user = await this.userRepository.findOne({
    where: { id, softDel: false },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await this.userRepository.save(user);

  return {
    status: true,
    statusCode: 200,
    message: 'User password reset successfully',
    data: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      updatedAt: user.updatedAt,
    },
  };

  } catch (error: any) {
    console.error('Error getting user:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

async createInstructor(dto: CreateStudentDto) {
  try {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    let password: string;

    if (dto.sendInvitationEmail) {
      password = Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(password, 10);

      const instructor = this.userRepository.create({
        fullname: dto.fullname,
        email: dto.email,
        password: hashedPassword,
        role: [Role.INSTRUCTOR],
      });

      const newInstructor = await this.userRepository.save(instructor);

      const token = await this.jwtService.signAsync(
        { sub: newInstructor.id, email: newInstructor.email },
        { secret: process.env.JWT_INVITE_SECRET, expiresIn: '24h' },
      );

      const inviteLink = `http://localhost:3000/reset_password/?token=${token}`;


      await this.mailHelper.sendTemplateMail('INVITATION_EMAIL', dto.email!, {
          name: dto.fullname!,
          inviteLink,
      });

      return {
        status: true,
        statusCode: 201,
        message: 'Instructor created and invitation email sent',
        data: newInstructor,
      };
    }

    else if (dto.password) {
      password = await bcrypt.hash(dto.password, 10);

      const instructor = this.userRepository.create({
        fullname: dto.fullname,
        email: dto.email,
        password,
        role: [Role.INSTRUCTOR],
      });

      const newInstructor = await this.userRepository.save(instructor);

      return {
        status: true,
        statusCode: 201,
        message: 'Instructor created successfully',
        data: newInstructor,
      };
    } else {
      throw new BadRequestException('Either password or invitation email must be provided');
    }
  } catch (error: any) {
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
    throw new InternalServerErrorException(error.message);
  }
}

async getAllInstructors(filterDto: GetInstructorsFilterDto, pagination: PaginationDto) {
  try {
    const { search, status } = filterDto;
    const { page = 1, limit = 10 } = pagination;

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.softDel = :softDel', { softDel: false })
      .andWhere(':instructorRole = ANY(user.role)', { instructorRole: Role.INSTRUCTOR });

    if (search) {
      query.andWhere('(user.fullname ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      const isActive = status === 'active';
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    query
      .leftJoin(
        'courses',
        'course',
        `course.creatorId = user.id 
         AND course.status = :publishedStatus 
         AND course.softDel = false`
      )
      .addSelect('COUNT(DISTINCT course.id)', 'coursesCount')

      .leftJoin(
        'enrollments',
        'enrollment',
        'enrollment.instructorId = user.id AND enrollment.softDel = false'
      )
      .addSelect('COALESCE(SUM(enrollment.totalAmount),0)', 'totalRevenue')
      // .addSelect(
      //   'COALESCE(SUM(CASE WHEN enrollment.status = :pending THEN enrollment.totalAmount ELSE 0 END),0)',
      //   'pendingPayout'
      // )

      .setParameter('pending', PaymentStatus.PENDING)
      .setParameter('publishedStatus', Status.PUBLISHED)

      .addSelect(
        `CASE 
           WHEN ARRAY['User','Instructor']::users_role_enum[] <@ user.role THEN 'Y'
           ELSE 'N'
         END`,
        'alsoStudent'
      )

      .groupBy('user.id')
      .orderBy('user.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const rawUsers = await query.getRawAndEntities();

    const usersWithStats = rawUsers.entities.map((u, idx) => ({
      id: u.id,
      fullname: u.fullname,
      email: u.email,
      courses: parseInt(rawUsers.raw[idx].coursesCount, 10) || 0,
      totalRevenue: parseFloat(rawUsers.raw[idx].totalRevenue) || 0,
      pendingPayout: parseFloat(rawUsers.raw[idx].pendingPayout) || 0,
      alsoStudent: rawUsers.raw[idx].alsoStudent,
      status: u.isActive ? 'Active' : 'Inactive',
    }));

    const total = await this.userRepository
      .createQueryBuilder('user')
      .where('user.softDel = false')
      .andWhere(':instructorRole = ANY(user.role)', { instructorRole: Role.INSTRUCTOR })
      .getCount();

    return {
      status: true,
      statusCode: 200,
      message: 'Instructors fetched successfully',
      data: {
        total,
        page,
        limit,
        data: usersWithStats,
      },
    };
  } catch (error: any) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    )
      throw error;
    throw new InternalServerErrorException(error.message);
  }
}









}
