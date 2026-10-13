import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Commission } from 'libs/database/src/entities/commission.entity';
import { User } from 'libs/database/src/entities/user.entity'
import { CreateCommissionDto, UpdateCommissionDto, PremiumInstructorOverrideDto, UpdateOverrideDto } from './dto/commission.dto';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

 
  async createCommission(dto: CreateCommissionDto) {
    try {
      const existing = await this.commissionRepository.findOne({ where: {} });
      if (existing)
        throw new BadRequestException('A commission record already exists. Please update instead.');

      const newCommission = this.commissionRepository.create({
        platformShareDefault: Number(dto.platformShareDefault),
        instructorShareDefault: Number(dto.instructorShareDefault),
        effectiveFrom: new Date(dto.effectiveFrom!),
      });

      const savedCommission = await this.commissionRepository.save(newCommission);

      return {
        status: true,
        statusCode: 201,
        message: 'Commission created successfully',
        data: savedCommission,
      };
    } catch (error: any) {
      console.error('Create Commission Error:', error);
      if ( error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  
  async getCommission() {
    try {
      const commission: any = await this.commissionRepository.findOne({ where: {} });
      if (!commission) throw new NotFoundException('No commission record found');

      let overrideWithDetails: any = [];

      if (commission.premiumInstructorOverrides?.length > 0) {
        const instructorIds = commission.premiumInstructorOverrides.map((o: { instructorId: string }) => o.instructorId);

        const instructors = await this.userRepository.find({
          where: { id: In(instructorIds) },
          select: ['id', 'fullname', 'email', 'profile'] 
        });

       overrideWithDetails = commission.premiumInstructorOverrides.map(
          (o: {
            instructorId: string;
            platformShare: number;
            instructorShare: number;
            effectiveFrom?: Date;
          }) => {
            const instructor = instructors.find(i => i.id === o.instructorId);
            return {
              ...o,
              instructor,
            };
          }
        );

      }

      return {
        status: true,
        statusCode: 200,
        message: 'Commission fetched successfully',
        data: {
          ...commission,
          premiumInstructorOverrides: overrideWithDetails, 
        },
      };

    } catch (error: any) {
      console.error('Get Commission Error:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) throw error;

      throw new InternalServerErrorException(error.message);
    }
  }

 
  async updateCommission(dto: UpdateCommissionDto) {
    try {
      const commission = await this.commissionRepository.findOne({ where: { } });
      if (!commission) throw new NotFoundException('Commission record not found');

      commission.platformShareDefault =
        dto.platformShareDefault !== undefined ? Number(dto.platformShareDefault) : commission.platformShareDefault;

      commission.instructorShareDefault =
        dto.instructorShareDefault !== undefined ? Number(dto.instructorShareDefault) : commission.instructorShareDefault;

      commission.effectiveFrom =
        dto.effectiveFrom ? new Date(dto.effectiveFrom) : commission.effectiveFrom;

      const updated = await this.commissionRepository.save(commission);

      return {
        status: true,
        statusCode: 200,
        message: 'Commission updated successfully',
        data: updated,
      };
    } catch (error: any) {
      console.error('Update Commission Error:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async addPremiumOverride(dto: PremiumInstructorOverrideDto) {
    try {
      const commission = await this.commissionRepository.findOne({ where: { } });
      if (!commission) throw new NotFoundException('Commission record not found');

      const overrides = commission.premiumInstructorOverrides || [];

      const existing = overrides.find(o => o.instructorId === dto.instructorId);

      if (existing) {
        existing.platformShare = Number(dto.platformShare);
        existing.instructorShare = Number(dto.instructorShare);
        existing.effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : existing.effectiveFrom;
      } else {
        overrides.push({
          instructorId: dto.instructorId!,
          platformShare: Number(dto.platformShare),
          instructorShare: Number(dto.instructorShare),
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        });
      }

      commission.premiumInstructorOverrides = overrides;

      const updated = await this.commissionRepository.save(commission);

      return {
        status: true,
        statusCode: 200,
        message: 'Premium instructor override added/updated successfully',
        data: updated,
      };
    } catch (error: any) {
      console.error('Premium Override Error:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateInstructorOverride(instructorId: string, dto: UpdateOverrideDto) { 
    try {
      const commission = await this.commissionRepository.findOne({ where: {} });
      if (!commission) throw new NotFoundException('Commission record not found');

      const overrides: any = commission.premiumInstructorOverrides ?? [];

      const index = overrides.findIndex((o: { instructorId: string }) => o.instructorId === instructorId);
      if (index === -1) throw new NotFoundException('Override for this instructor not found');

      overrides[index] = {
        ...overrides[index],
        platformShare: dto.platformShare,
        instructorShare: dto.instructorShare,
        effectiveFrom: dto.effectiveFrom ?? overrides[index].effectiveFrom,
      };

      commission.premiumInstructorOverrides = overrides;
      await this.commissionRepository.save(commission);

      return {
        status: true,
        statusCode: 200,
        message: 'Override updated successfully',
        data: commission,
      };
    } catch (error: any) {
      console.error('Update Instructor Override Error:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteInstructorOverride(instructorId: string) {
    const commission = await this.commissionRepository.findOne({ where: {} });
    if (!commission) throw new NotFoundException('Commission record not found');

    const overrides = commission.premiumInstructorOverrides ?? [];
    const newOverrides = overrides.filter(o => o.instructorId !== instructorId);

    if (newOverrides.length === overrides.length) {
      throw new NotFoundException('Override for this instructor not found');
    }

    commission.premiumInstructorOverrides = newOverrides;
    await this.commissionRepository.save(commission);

    return {
      status: true,
      message: 'Override removed successfully',
    };
  }

}
