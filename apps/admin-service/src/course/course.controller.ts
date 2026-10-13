import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CourseApprovalDto, CreateAdminReplyDto, EditReviewDto } from './dto/course.dto';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles, CurrentUser } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';

@ApiTags('Course')
@Controller('/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}



  @Get('all')
      @ApiOperation({ summary: 'Fetch All Course' })
      @ApiBearerAuth('jwt-auth')
      @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
      @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async fetchAllCourse(@PaginationQuery() pagination: PaginationDto) {
              return this.courseService.getAllCourses(pagination);
            }


  @Put('status/:id')
      @ApiOperation({ summary: 'Update Course status' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async updateCourseStatus( @Param('id') id: string, @Body() dto: CourseApprovalDto) {
              return this.courseService.updateStatus(id, dto);
            }

  @Delete('/deleteCourse/:courseId')
      @ApiOperation({ summary: 'Soft delete a course' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async deleteCourse( @Param('courseId') courseId: string) {
                    return this.courseService.deleteCourse(courseId );
            }

  @Get('/validate/:id')
      @ApiOperation({ summary: 'Check if course has all required fields completed' })
      @ApiBearerAuth('jwt-auth')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.ADMIN)
            async validateCourse(@Param('id') id: string) {
              return this.courseService.validateCourse(id);
            }


  @Post('/reply/:id')
      @ApiOperation({ summary: 'Reply by Admin for a review' })
              @ApiBearerAuth('jwt-auth')
              @UseGuards(JwtAuthGuard, RolesGuard)
              @Roles(Role.ADMIN)
                  async addReply( @Param('id') id: string, @Body() dto: CreateAdminReplyDto,  @CurrentUser() user: { userId: string }) {
                      return this.courseService.addReplyToReview(id, dto, user.userId);
                  }
  
  @Get('/reviews')
            @ApiOperation({ summary: 'Admin: Get all reviews' })
            @ApiBearerAuth('jwt-auth')
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async getAllInstructorReviews(@PaginationQuery() pagination: PaginationDto) {
                    return this.courseService.getAllReviews(pagination);
                }

  @Get('/review/:id')
            @ApiOperation({ summary: 'Admin: Get single review by ID' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async getReviewById(@Param('id') id: string) {
                  return this.courseService.getReviewById(id);
                }

  @Put('/review/:id')
            @ApiOperation({ summary: 'Admin: Edit a review' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async editReview( @Param('id') id: string, @Body() dto: EditReviewDto, @CurrentUser() user: { userId: string }) {
                  return this.courseService.editReview(id, dto);
                }

  @Delete('/deleteReview/:id')
            @ApiOperation({ summary: 'Soft delete a course review' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async deleteReview( @Param('id') id: string) {
                    return this.courseService.deleteReview( id );
                }

}
