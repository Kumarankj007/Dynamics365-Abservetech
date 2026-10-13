import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from 'libs/database/src/entities/subcategory.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './dto/subcategory.dto';


@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  async create(dto: CreateSubCategoryDto) {
    try {
      const existing = await this.subCategoryRepository.findOne({
        where: { subcategory: dto.subcategory, softDel: false },
      });
      if (existing) throw new BadRequestException('Sub Category already exists');

      const subcategory = this.subCategoryRepository.create(dto);
      const newSubCategory = await this.subCategoryRepository.save(subcategory);

      return {
        status: true,
        statusCode: 201,
        message: 'New Sub Category successfully created',
        data: newSubCategory,
      };
    } catch (error: any) {
        console.error('---------error', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async fetchAll(paginationDto: PaginationDto, categoryId?: string) {
  try {
    const { page = 1, limit = 10 } = paginationDto;

    const query = this.subCategoryRepository
      .createQueryBuilder('sub')
      .leftJoinAndMapOne(
        'sub.category',      
        'categories',       
        'cat',           
        'sub.categoryId = cat.id AND cat.softDel = false'
      )
      .where('sub.softDel = :softDel', { softDel: false })
      if (categoryId) {
         query.andWhere('sub.categoryId = :categoryId', { categoryId });
      }
      query.orderBy('sub.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [subcategories, total] = await query.getManyAndCount();

    return {
      status: true,
      statusCode: 200,
      message: 'All subcategories fetched successfully',
      data: {
        total,
        page,
        limit,
        data: subcategories,
      },
    };
  } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
  }
  }


  async fetchOne(subcategoryId: string) {
    try {
      const subcategory = await this.subCategoryRepository.findOne({
        where: { id: subcategoryId, softDel: false },
        select: ['id', 'subcategory', 'description', 'createdAt', 'updatedAt'],
      });

      if (!subcategory) throw new NotFoundException('Sub Category not found');

      return {
        status: true,
        statusCode: 200,
        message: 'Category fetched successfully',
        data: subcategory,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(subcategoryId: string, dto: UpdateSubCategoryDto) {
    try {
      const subcategory = await this.subCategoryRepository.findOne({
        where: { id: subcategoryId, softDel: false },
      });
      if (!subcategory) throw new NotFoundException('Sub Category not found');

      await this.subCategoryRepository.update(subcategoryId, dto);
      const updatedSubCategory = await this.subCategoryRepository.findOne({
        where: { id: subcategoryId },
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Sub Category successfully updated',
        data: updatedSubCategory,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(subcategoryId: string) {
    try {
      const subcategory = await this.subCategoryRepository.findOne({
        where: { id: subcategoryId },
      });
      if (!subcategory) throw new NotFoundException('Sub Category not found');

      subcategory.softDel = true;
      const deletedSubCategory = await this.subCategoryRepository.save(subcategory);

      return {
        status: true,
        statusCode: 200,
        message: 'Sub Category deleted successfully',
        data: deletedSubCategory,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
