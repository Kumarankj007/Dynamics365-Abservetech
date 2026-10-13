import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from 'libs/database/src/entities/tags.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';


@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

 async create(dto: CreateTagDto) {
     try {
       const existing = await this.tagRepository.findOne({
         where: { tag: dto.tag, softDel: false },
       });
       if (existing)
         throw new BadRequestException('Tag with this name already exists');
 
       const tag = this.tagRepository.create(dto);
       const savedTag = await this.tagRepository.save(tag);
 
       return {
         status: true,
         statusCode: 201,
         message: 'New tag successfully created',
         data: savedTag,
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
 
       const [tags, total] = await this.tagRepository.findAndCount({
         where: { softDel: false },
         order: { createdAt: 'DESC' },
         skip: (page - 1) * limit,
         take: limit,
       });
 
       return {
         status: true,
         statusCode: 200,
         message: 'All tags fetched successfully',
         data: {
           total,
           page,
           limit,
           data: tags,
         },
       };
     } catch (error: any) {
        console.error('---------error', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
     }
   }


   async fetchOne(tagId: string) {
      try {
        const tag = await this.tagRepository.findOne({ where: { id: tagId } });
  
        if (!tag) throw new NotFoundException('Tag not found');
  
        return {
          status: true,
          statusCode: 200,
          message: 'Tag fetched successfully',
          data: tag,
        };
      } catch (error: any) {
        console.error('---------error', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
      }
    }

   async update(tagId: string, dto: UpdateTagDto) {
      try {
        const tag = await this.tagRepository.findOne({ where: { id: tagId } });
        if (!tag) throw new NotFoundException('Tag not found');
  
        await this.tagRepository.update(tagId, dto);
        const updatedTag = await this.tagRepository.findOne({ where: { id: tagId } });
  
        return {
          status: true,
          statusCode: 200,
          message: 'Tag successfully updated',
          data: updatedTag,
        };
      } catch (error: any) {
        console.error('---------error', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
      }
    }

  async delete(tagId: string) {
    try {
      const tag = await this.tagRepository.findOne({
        where: { id: tagId },
      });
      if (!tag) throw new NotFoundException('Tag not found');

      tag.softDel = true;
      const deletedTag = await this.tagRepository.save(tag);

      return {
        status: true,
        statusCode: 200,
        message: 'Tag deleted successfully',
        data: deletedTag,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
