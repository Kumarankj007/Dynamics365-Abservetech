import { Body, Controller, Post, Get, Put, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Tags')
@Controller('/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('add')
      @ApiOperation({ summary: 'Create a new tag' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async create(@Body() dto: CreateTagDto) {
              return this.tagService.create(dto);
            }

  @Get('fetchAll')
      @ApiOperation({ summary: 'Get all tags' })
      //@ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      // @UseGuards(JwtAuthGuard, RolesGuard)
      // @Roles(Role.ADMIN,Role.USER)
            async findAll(@PaginationQuery() pagination: PaginationDto) {
              return this.tagService.fetchAll(pagination);
            }

  @Get('fetchOne/:id')
      @ApiOperation({ summary: 'Get tag' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findOne(@Param('id') id: string) {
              return this.tagService.fetchOne(id);
            }

  @Put('update/:id')
      @ApiOperation({ summary: 'Update tag band' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
              return this.tagService.update(id, dto);
            }


    @Delete('delete/:id')
        @ApiOperation({ summary: 'Delete Tag' })
        @ApiBearerAuth('jwt-auth')
        @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.ADMIN)
              async remove(@Param('id') id: string) {
                return this.tagService.delete(id);
              }
}
