import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get admin dashboard aggregated metrics' })
  async getDashboard(@Query() query: DashboardQueryDto) {
    return this.service.getDashboard(query);
  }
}
