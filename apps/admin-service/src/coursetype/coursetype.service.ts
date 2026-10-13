import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseType } from 'libs/database/src/entities/coursetype.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateCourseTypeDto, UpdateCourseTypeDto } from './dto/coursetype.dto';


@Injectable()
export class CourseTypeService {
  constructor(
    @InjectRepository(CourseType)
    private readonly courseTypeRepository: Repository<CourseType>,
  ) {}

  async create(dto: CreateCourseTypeDto) {
    try {
      const existing = await this.courseTypeRepository.findOne({
        where: { name: dto.name, softDel: false },
      });
      if (existing) throw new BadRequestException('Course Type already exists');

      const CourseType = this.courseTypeRepository.create(dto);
      const newCourseType = await this.courseTypeRepository.save(CourseType);

      return {
        status: true,
        statusCode: 201,
        message: 'Course Type successfully created',
        data: newCourseType,
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

      const [coursetype, total] = await this.courseTypeRepository.findAndCount({
        where: { softDel: false },
        select: ['id', 'name', 'description', 'icon', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (!coursetype.length) throw new NotFoundException('No course type found');

      return {
        status: true,
        statusCode: 200,
        message: 'All course type fetched successfully',
        data: {
          total,
          page,
          limit,
          data: coursetype,
        },
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async fetchOne(categoryId: string) {
    try {
      const category = await this.courseTypeRepository.findOne({
        where: { id: categoryId, softDel: false },
        select: ['id', 'name', 'description', 'icon', 'createdAt', 'updatedAt'],
      });

      if (!category) throw new NotFoundException('Category not found');

      return {
        status: true,
        statusCode: 200,
        message: 'Category fetched successfully',
        data: category,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(categoryId: string, dto: UpdateCourseTypeDto) {
    try {
      const category = await this.courseTypeRepository.findOne({
        where: { id: categoryId, softDel: false },
      });
      if (!category) throw new NotFoundException('Category not found');

      await this.courseTypeRepository.update(categoryId, dto);
      const updatedCategory = await this.courseTypeRepository.findOne({
        where: { id: categoryId },
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Category successfully updated',
        data: updatedCategory,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(categoryId: string) {
    try {
      const category = await this.courseTypeRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');

      category.softDel = true;
      const deletedCategory = await this.courseTypeRepository.save(category);

      return {
        status: true,
        statusCode: 200,
        message: 'Category deleted successfully',
        data: deletedCategory,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
