import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'libs/database/src/entities/category.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    try {
      const existing = await this.categoryRepository.findOne({
        where: { category: dto.category, softDel: false },
      });
      if (existing) throw new BadRequestException('Category already exists');

      const category = this.categoryRepository.create(dto);
      const newCategory = await this.categoryRepository.save(category);

      return {
        status: true,
        statusCode: 201,
        message: 'Category successfully created',
        data: newCategory,
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

      const [categories, total] = await this.categoryRepository.findAndCount({
        where: { softDel: false },
        select: ['id', 'category', 'description', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });


      return {
        status: true,
        statusCode: 200,
        message: 'All categories fetched successfully',
        data: {
          total,
          page,
          limit,
          data: categories,
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
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, softDel: false },
        select: ['id', 'category', 'description', 'createdAt', 'updatedAt'],
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

  async update(categoryId: string, dto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, softDel: false },
      });
      if (!category) throw new NotFoundException('Category not found');

      await this.categoryRepository.update(categoryId, dto);
      const updatedCategory = await this.categoryRepository.findOne({
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
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');

      category.softDel = true;
      const deletedCategory = await this.categoryRepository.save(category);

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
