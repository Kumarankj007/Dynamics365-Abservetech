import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminRegisterDto, AdminLoginDto, AdminUpdateDto } from './dto/admin.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles, CurrentUser } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Admin Authentication')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
      @ApiOperation({ summary: 'Register Admin' })
          async register(@Body() dto: AdminRegisterDto) {
            return this.adminService.register(dto);
          }

  @Post('login')
      @ApiOperation({ summary: 'Login Admin' })
          async login(@Body() dto: AdminLoginDto) {
            return this.adminService.login(dto);
          }

  @Get('profile')
      @ApiOperation({ summary: 'Admin Profile' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
          async profile(@CurrentUser() user: { userId: string }) {
            return this.adminService.profile(user.userId);
          }

  @Get('admins')
      @ApiOperation({ summary: 'Get All Admins' })
      @ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
          async getAllAdmins(@PaginationQuery() pagination: PaginationDto) {
            return this.adminService.getAdmins(pagination);
          }

  @Get('admins/:id')
      @ApiOperation({ summary: 'Get Admin by ID' })
      @ApiBearerAuth('jwt-auth')
      @ApiParam({ name: 'id', type: String, description: 'Admin ID' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
          async getAdmin(@Param('id') id: string) {
            return this.adminService.getAdmin(id);
          }
  @Put('update')
      @ApiOperation({ summary: 'Update Admin' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
          async update(@CurrentUser() user: { userId: string }, @Body() dto: AdminUpdateDto) {
            return this.adminService.update(user.userId, dto);
          }

  @Delete('delete/:id')
    @ApiOperation({ summary: 'Delete Admin' })
    @ApiBearerAuth('jwt-auth')
    @ApiParam({ name: 'id', type: String, description: 'Admin ID' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
        async delete(@Param('id') id: string) {
          return this.adminService.delete(id);
       }
}
