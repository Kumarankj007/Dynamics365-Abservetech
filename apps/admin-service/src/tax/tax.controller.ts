import { Controller, Post, Get, Put, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxDto, UpdateTaxDto } from './dto/tax.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Tax')
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('add')
    @ApiOperation({ summary: 'Create a new tax' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async create(@Body() dto: CreateTaxDto) {
        return this.taxService.create(dto);
      }

  @Get('fetch')
    @ApiOperation({ summary: 'Get tax' })
      async getTax() {
        return this.taxService.getTax();
      }

  @Put('update')
    @ApiOperation({ summary: 'Update tax' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
      async update(@Body() dto: UpdateTaxDto) {
        return this.taxService.update(dto);
      }
}
