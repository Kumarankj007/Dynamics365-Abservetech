import { Controller, Post, Get, Patch, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommissionService } from './commission.service';
import { CreateCommissionDto, UpdateCommissionDto, PremiumInstructorOverrideDto, UpdateOverrideDto } from './dto/commission.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Commission')
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Post('add')
    @ApiOperation({ summary: 'Create Commission Default Values' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async create(@Body() dto: CreateCommissionDto) {
        return this.commissionService.createCommission(dto);
      }

  @Put('update')
    @ApiOperation({ summary: 'Update Commission Default Values' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async update(@Body() dto: UpdateCommissionDto) {
        return this.commissionService.updateCommission(dto);
      }

  @Get('fetch')
    @ApiOperation({ summary: 'Fetch Current Commission Settings' })
      async get() {
        return this.commissionService.getCommission();
      }

  @Post('override/add')
    @ApiOperation({ summary: 'Add Premium Instructor Commission Override' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async addOverride(@Body() dto: PremiumInstructorOverrideDto) {
        return this.commissionService.addPremiumOverride(dto);
      }


  @Patch('override/:instructorId')
    @ApiOperation({ summary: 'Update Premium Instructor Commission Override' })
    @ApiParam({ name: 'instructorId', description: 'Instructor ID' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async updateOverride( @Param('instructorId') instructorId: string, @Body() dto: UpdateOverrideDto) {
        return this.commissionService.updateInstructorOverride(instructorId, dto);
      }


  @Delete('override/:instructorId')
    @ApiOperation({ summary: 'Delete Premium Instructor Commission Override' })
    @ApiParam({ name: 'instructorId', description: 'Instructor ID' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async removeOverride(@Param('instructorId') instructorId: string) {
        return this.commissionService.deleteInstructorOverride(instructorId);
      }

}
