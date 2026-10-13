import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { CourseTypeService } from './coursetype.service';
import { CreateCourseTypeDto, UpdateCourseTypeDto } from './dto/coursetype.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { UploadService } from 'libs/common/src/uploads/local/uploads.service';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('CourseType')
@Controller('/coursetype')
export class CourseTypeController {
  constructor(
    private readonly courseTypeService: CourseTypeService,
    private readonly uploadService: UploadService, 
  ) {}

  @Post('add')
      @ApiOperation({ summary: 'Create Course Type' })
      @ApiConsumes('multipart/form-data')
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
      @UseInterceptors(FileInterceptor('icon'))
            async create(@Body() dto: CreateCourseTypeDto, @UploadedFile() file: Express.Multer.File) {
              if (file) dto.icon = this.uploadService.getUploadPath(file.filename);
              return this.courseTypeService.create(dto);
            }

  @Get('fetchAll')
      @ApiOperation({ summary: 'Get all course types' })
      @ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findAll(@PaginationQuery() pagination: PaginationDto) {
              return this.courseTypeService.fetchAll(pagination);
            }

  @Get('fetchOne/:id')
      @ApiOperation({ summary: 'Get course type' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Coursetype ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findOne(@Param('id') id: string) {
              return this.courseTypeService.fetchOne(id);
            }

  @Put('update/:id')
      @ApiOperation({ summary: 'Update course type' })
      @ApiConsumes('multipart/form-data')
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Coursetype ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
      @UseInterceptors(FileInterceptor('icon'))
            async update(@Param('id') id: string, @Body() dto: UpdateCourseTypeDto, @UploadedFile() file: Express.Multer.File) {
              if (file) dto.icon = this.uploadService.getUploadPath(file.filename);
              return this.courseTypeService.update(id, dto);
            }

  @Delete('delete/:id')
      @ApiOperation({ summary: 'Delete course type' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Coursetype ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async remove(@Param('id') id: string) {
              return this.courseTypeService.delete(id);
            }
}
