import { Controller, Post, Get, Put, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { UpdateSubscriptionStatusDto } from './dto/enrollments.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('all')
       @ApiOperation({ summary: 'Fetch All Course' })
       @ApiBearerAuth('jwt-auth')
       @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
       @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
       @UseGuards(JwtAuthGuard, RolesGuard)
       @Roles(Role.ADMIN)
          async getAllEnrollmentsForAdmin(@PaginationQuery() pagination: PaginationDto) {
            return this.enrollmentsService.getAllEnrollmentsForAdmin(pagination);
          }

  @Patch(':id/subscription-status')
        @ApiOperation({ summary: 'Update enrollment subscription status' })
        @ApiBearerAuth('jwt-auth')
        @ApiParam({ name: 'id', description: 'Enrollment ID' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.ADMIN)
          async updateSubscriptionStatus( @Param('id') id: string, @Body() dto: UpdateSubscriptionStatusDto) {
            return this.enrollmentsService.updateSubscriptionStatus(id, dto);
          }
}
