import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Category')
@Controller('/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
      @ApiOperation({ summary: 'Create a new category' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async create(@Body() dto: CreateCategoryDto) {
              return this.categoryService.create(dto);
            }

  @Get('fetchAll')
      @ApiOperation({ summary: 'Get all categories' })
      //@ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      // @UseGuards(JwtAuthGuard, RolesGuard)
      // @Roles(Role.ADMIN,Role.USER)
            async findAll(@PaginationQuery() pagination: PaginationDto) {
              return this.categoryService.fetchAll(pagination);
            }

  @Get('fetchOne/:id')
      @ApiOperation({ summary: 'Get category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findOne(@Param('id') id: string) {
              return this.categoryService.fetchOne(id);
            }

  @Put('update/:id')
      @ApiOperation({ summary: 'Update category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
              return this.categoryService.update(id, dto);
            }

  @Delete('delete/:id')
      @ApiOperation({ summary: 'Delete category' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Category ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async remove(@Param('id') id: string) {
              return this.categoryService.delete(id);
            }
}
