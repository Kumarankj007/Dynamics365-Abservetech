import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubCategoryService } from './subcategory.service';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './dto/subcategory.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Sub Category')
@Controller('/subcategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post('add')
      @ApiOperation({ summary: 'Create a new sub category' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async create(@Body() dto: CreateSubCategoryDto) {
              return this.subCategoryService.create(dto);
            }

  @Get('fetchAll')
      @ApiOperation({ summary: 'Get all categories' })
      //@ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      @ApiQuery({ name: 'categoryId', required: false, type: String, example: 'c1a4a6f3-2b32-47f8-9f2e-3b5a0d7f7cde', description: 'Optional category ID to filter subcategories' })
      // @UseGuards(JwtAuthGuard, RolesGuard)
      // @Roles(Role.ADMIN,Role.USER)
            async findAll(@PaginationQuery() pagination: PaginationDto, @Query('categoryId') categoryId?: string) {
              return this.subCategoryService.fetchAll(pagination, categoryId);
            }

  @Get('fetchOne/:id')
      @ApiOperation({ summary: 'Get  sub category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Sub Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findOne(@Param('id') id: string) {
              return this.subCategoryService.fetchOne(id);
            }

  @Put('update/:id')
      @ApiOperation({ summary: 'Update sub category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Sub Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
              return this.subCategoryService.update(id, dto);
            }

  @Delete('delete/:id')
      @ApiOperation({ summary: 'Delete sub category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Sub Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async remove(@Param('id') id: string) {
              return this.subCategoryService.delete(id);
            }
}
