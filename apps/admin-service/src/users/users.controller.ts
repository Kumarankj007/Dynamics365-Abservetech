import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateStudentDto, GetUsersFilterDto, GetInstructorsFilterDto } from './dto/users.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('UserManagement')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Student Management Endpoints

   @Post('users')
      @ApiOperation({ summary: 'Create a new student' })
        async createStudent(@Body() dto: CreateStudentDto) {
          return this.userService.createStudent(dto);
        }

   @Patch('users/status/:id')
      @ApiOperation({ summary: 'Activate or deactivate a user' })
      @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true }}, required: ['isActive']}})
        async updateUserStatus( @Param('id') id: string, @Body('isActive') isActive: boolean) {
          return this.userService.updateUserStatus(id, isActive);
        }

    @Delete('users/:id')
       @ApiOperation({ summary: 'Delete a user' })
        async deleteUser(@Param('id') id: string) {
          return this.userService.deleteUser(id);
        }

    @Get('users')
      @ApiOperation({ summary: 'Get all users with filters and pagination' })
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
        async getAllUsers( @Query() filterDto: GetUsersFilterDto, @PaginationQuery() pagination: PaginationDto) {
          const { page = 1, limit = 10 } = pagination;
          return this.userService.getAllUsers(filterDto, { page, limit });
        }

    @Get('access')
       @ApiOperation({ summary: 'Get all users with courses '})
       async getUsersWithCourses() {
        return this.userService.getAllUserswithCourses()
       }

    @Get('users/:id')
      @ApiOperation({ summary: 'Get single user by ID' })
      @ApiParam({ name: 'id', required: true, description: 'User ID', type: String })
        async getUserById(@Param('id') id: string) {
          return this.userService.getUserById(id);
        }

    @Patch('users/reset-password/:id')
      @ApiOperation({ summary: 'Reset a user password' })
      @ApiParam({ name: 'id', required: true, description: 'User ID', type: String })
      @ApiBody({ schema: { type: 'object', properties: { newPassword: { type: 'string', example: 'NewPass@123' }}, required: ['newPassword']}})
        async resetUserPassword( @Param('id') id: string, @Body('newPassword') newPassword: string) {
          return this.userService.resetUserPassword(id, newPassword);
        }


    // Instructor Management Endpoints

    @Post('create-instructor')
      @ApiOperation({ summary: 'Create a new instructor' })
        async createInstructor(@Body() dto: CreateStudentDto) {
          return this.userService.createInstructor(dto);
        }

    @Get('instructors')
      @ApiOperation({ summary: 'Get all instructors with filters and pagination' })
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
        async getAllInstructors( @Query() filterDto: GetInstructorsFilterDto, @PaginationQuery() pagination: PaginationDto) {
          const { page = 1, limit = 10 } = pagination;
          return this.userService.getAllInstructors(filterDto, { page, limit });
        }

}