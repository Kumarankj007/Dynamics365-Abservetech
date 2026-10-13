import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { AdminRegisterDto, AdminLoginDto, AdminUpdateDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AdminRegisterDto) {
    try {
        const existing = await this.adminRepository.findOne({ where: { email: dto.email } });
        if (existing) throw new BadRequestException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password!, 10);
        const admin = this.adminRepository.create({ ...dto, password: hashedPassword });
        const newAdmin = await this.adminRepository.save(admin);

        return {
          status: true,
          statusCode: 201,
          message: 'Admin successfully registered',
          data: newAdmin,
        };
    } catch (error: any) {
          console.log("---------error", error)
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
    }
  }

  async login(dto: AdminLoginDto) {
    try {
        const admin = await this.adminRepository.findOne({ where: { email: dto.email } });
        if (!admin) throw new NotFoundException('Admin not found');

        const isPasswordValid = await bcrypt.compare(dto.password!, admin.password!);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: admin.id, email: admin.email, role: admin.role, currentRole: admin.currentRole };
        const token = await this.jwtService.signAsync(payload);

        return {
          status: true,
          statusCode: 200,
          message: 'Admin successfully logged in',
          data: { admin, token },
        };
    } catch (error: any) {
          console.log("---------error", error)
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
    }
  }

  async profile(userId: string) {
    try {
        const admin = await this.adminRepository.findOne({ where: { id: userId } });
        if (!admin) throw new NotFoundException('Admin not found');

        const { password, ...rest } = admin;
        return {
          status: true,
          statusCode: 200,
          message: 'Admin profile fetched',
          data: rest,
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async update(userId: string, dto: AdminUpdateDto) {
    try {
        if (dto.password) {
          dto.password = await bcrypt.hash(dto.password, 10);
        }

        await this.adminRepository.update(userId, dto);
        const updatedAdmin = await this.adminRepository.findOne({ where: { id: userId } });
        if (!updatedAdmin) throw new NotFoundException('Admin not found');

        const { password, ...rest } = updatedAdmin;
        return {
          status: true,
          statusCode: 200,
          message: 'Admin successfully updated',
          data: rest,
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async getAdmins(paginationDto: PaginationDto) {
    try {
        const { page = 1, limit = 10 } = paginationDto;

        const [admins, total] = await this.adminRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: 'DESC' },
        });

        if (!admins.length) throw new NotFoundException('No admins found');

        const filteredAdmins = admins.map(({ password, ...rest }) => rest);

        return {
          status: true,
          statusCode: 200,
          message: 'All admins fetched',
          data: {
            total,
            page,
            limit,
            data: filteredAdmins,
          },
        } 
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message); 
    };
  }

  async getAdmin(id: string) {
    try {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) throw new NotFoundException('Admin not found');

        const { password, ...rest } = admin;
        return {
          status: true,
          statusCode: 200,
          message: 'Admin fetched successfully',
          data: rest,
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message); 
    }
  }

  async delete(id: string) {
    try {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) throw new NotFoundException('Admin not found');

        admin.softDel = true; 
        await this.adminRepository.save(admin);

        const { password, ...rest } = admin;
        return {
          status: true,
          statusCode: 200,
          message: 'Admin deleted successfully',
          data: rest,
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

}
