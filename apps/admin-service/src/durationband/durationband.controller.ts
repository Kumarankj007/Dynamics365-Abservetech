import { Body, Controller, Post, Get, Put, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DurationBandService } from './durationband.service';
import { CreateDurationBandDto, UpdateDurationBandDto } from './dto/durationband.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Duration Band')
@Controller('/durationband')
export class DurationBandController {
  constructor(private readonly durationBandService: DurationBandService) {}

  @Post('add')
      @ApiOperation({ summary: 'Create a new duration band' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async create(@Body() dto: CreateDurationBandDto) {
              return this.durationBandService.create(dto);
            }

  @Get('fetchAll')
      @ApiOperation({ summary: 'Get all duration bands' })
      //@ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      // @UseGuards(JwtAuthGuard, RolesGuard)
      // @Roles(Role.ADMIN,Role.USER)
            async findAll(@PaginationQuery() pagination: PaginationDto) {
              return this.durationBandService.fetchAll(pagination);
            }

  @Get('fetchOne/:id')
      @ApiOperation({ summary: 'Get duration band' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Duration Band ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN,Role.USER)
            async findOne(@Param('id') id: string) {
              return this.durationBandService.fetchOne(id);
            }

  @Put('update/:id')
      @ApiOperation({ summary: 'Update duration band' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Duration Band ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async update(@Param('id') id: string, @Body() dto: UpdateDurationBandDto) {
              return this.durationBandService.update(id, dto);
            }

  @Patch('active/:id')
      @ApiOperation({ summary: 'Active/Deactive duration band' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Duration Band ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async remove(@Param('id') id: string) {
              return this.durationBandService.delete(id);
            }
}
