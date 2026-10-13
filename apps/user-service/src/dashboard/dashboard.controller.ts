import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { RevenuePaginationDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get instructor dashboard aggregated metrics' })
  async getInstructorDashboard( @Req() req:any, @Query() pagination: RevenuePaginationDto,) 
  {
    const instructorId = req.user?.userId;
    return this.dashboardService.getDashboard(instructorId, pagination);
  }
}
