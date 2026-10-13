import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DurationBand } from 'libs/database/src/entities/durationband.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateDurationBandDto, UpdateDurationBandDto } from './dto/durationband.dto';


@Injectable()
export class DurationBandService {
  constructor(
    @InjectRepository(DurationBand)
    private readonly durationBandRepository: Repository<DurationBand>,
  ) {}

 async create(dto: CreateDurationBandDto) {
     try {
       const existing = await this.durationBandRepository.findOne({
         where: { label: dto.label },
       });
       if (existing)
         throw new BadRequestException('Duration band with this label already exists');
 
       const durationBand = this.durationBandRepository.create(dto);
       const savedBand = await this.durationBandRepository.save(durationBand);
 
       return {
         status: true,
         statusCode: 201,
         message: 'New Duration Band successfully created',
         data: savedBand,
       };
     } catch (error: any) {
       console.error('---------error', error);
       if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
       throw new InternalServerErrorException(error.message);
     }
   }

   async fetchAll(paginationDto: PaginationDto) {
     try {
       const { page = 1, limit = 10 } = paginationDto;
 
       const [bands, total] = await this.durationBandRepository.findAndCount({
         order: { createdAt: 'DESC' },
         skip: (page - 1) * limit,
         take: limit,
       });
 
 
       return {
         status: true,
         statusCode: 200,
         message: 'All duration bands fetched successfully',
         data: {
           total,
           page,
           limit,
           data: bands,
         },
       };
     } catch (error: any) {
        console.error('Error fetching duration bands:', error);
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(error.message);
     }
   }


   async fetchOne(durationbandId: string) {
      try {
        const band = await this.durationBandRepository.findOne({ where: { id: durationbandId } });
  
        if (!band) throw new NotFoundException('Duration Band not found');
  
        return {
          status: true,
          statusCode: 200,
          message: 'Duration Band fetched successfully',
          data: band,
        };
      } catch (error: any) {
          console.error('---------error', error);
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
      }
    }

   async update(durationbandId: string, dto: UpdateDurationBandDto) {
      try {
        const band = await this.durationBandRepository.findOne({ where: { id: durationbandId } });
        if (!band) throw new NotFoundException('Duration Band not found');
  
        await this.durationBandRepository.update(durationbandId, dto);
        const updatedBand = await this.durationBandRepository.findOne({ where: { id: durationbandId } });
  
        return {
          status: true,
          statusCode: 200,
          message: 'Duration Band successfully updated',
          data: updatedBand,
        };
      } catch (error: any) {
          console.error('---------error', error);
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
      }
    }

  async delete(durationbandId: string) {
    try {
      const course = await this.durationBandRepository.findOne({ where: { id: durationbandId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.isActive = !course.isActive;
    await this.durationBandRepository.save(course);

    return {
      status: true,
      statusCode: 200,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: course.id, isActive: course.isActive },
    };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
