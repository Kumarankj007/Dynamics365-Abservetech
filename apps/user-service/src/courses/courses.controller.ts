import { Body, Controller, Post, Get, Put, Delete, UseGuards, Param, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, Query, Req, Patch  } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CourseService } from './courses.service';
import { CreateTitleDto, AddLearningOutcomesDto, AddCourseDescriptionDto, AddCourseModuleDto, UploadLectureAttachmentDto, CreateInstructorReplyDto, AddCoursePricingDto, UploadLectureVideoDto, CreateCourseReviewDto, AddCourseCurriculumDto } from './dto/courses.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { UploadService } from 'libs/common/src/uploads/local/uploads.service';
import { AwsUploadService } from 'libs/common/src/uploads/aws/aws-uploads.service';
import { Roles, CurrentUser } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';
import { ContentType } from 'libs/access/src/enums/course.enum';


@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    // private readonly uploadService: UploadService,
    private readonly awsUploadService: AwsUploadService
) {}

        @Post('/add-title')
            @ApiOperation({ summary: 'Add title of course' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async addTitle( @CurrentUser() user: { userId: string }, @Body() dto: CreateTitleDto) {
                    return this.courseService.addTitle(dto, user.userId);
                }

        @Post('/learning-outcomes/:courseId')
           @ApiOperation({ summary: 'Add learning outcomes to a course' })
           @ApiBearerAuth('jwt-auth')
           @UseGuards(JwtAuthGuard, RolesGuard)
           @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async addLearningOutcomes( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string, currentRole: Role }, @Body() dto: AddLearningOutcomesDto) {
                    return this.courseService.addLearningOutcomes(courseId, dto, user.userId, user.currentRole);
                }

        @Post('/course-description/:courseId')
           @ApiOperation({ summary: 'Add description to a course' })
           @ApiBearerAuth('jwt-auth')
           @UseGuards(JwtAuthGuard, RolesGuard)
           @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async addCourseDescription( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string, currentRole: Role }, @Body() dto: AddCourseDescriptionDto) {
                    return this.courseService.addCourseDescription(courseId, dto, user.userId, user.currentRole);
                }

        @Post('/upload-lecture-video')
            @ApiOperation({ summary: 'Upload a single lecture video to AWS S3 and return its URL' })
            @ApiConsumes('multipart/form-data')
            @ApiBody({ type: UploadLectureVideoDto })
            @ApiQuery({ name: 'type',required: false,type: String,enum: ['course-intros', 'course-lectures'], example: 'course-lectures', description: 'Target folder for upload '})
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
            @UseInterceptors(FileInterceptor('lectureFiles'))
                async uploadLectureVideo( @UploadedFile() file: Express.Multer.File, @Query('type') type?: string ) {
                    if (!file) throw new BadRequestException('No file provided.');
                    const validFolders:any = ['course-intros', 'course-lectures'];
                    const targetFolder = validFolders.includes(type) ? type : 'course-lectures';
                    return await this.courseService.uploadLectureVideo(file,targetFolder);
                }

        @Post('/upload-lecture-attachment')
            @ApiOperation({ summary: 'Upload lecture attachment (PDF, Word, Excel)' })
            @ApiConsumes('multipart/form-data')
            @ApiBody({ schema: { type: 'object', properties: { attachment: { type: 'string', format: 'binary' }}}})
            @ApiQuery({ name: 'type', required: false, type: String, enum: ['course-attachments'], example: 'course-attachments'})
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
            @UseInterceptors(FileInterceptor('attachment'))
                async uploadLectureAttachment( @UploadedFile() file: Express.Multer.File, @Query('type') type?: string) {
                    if (!file) throw new BadRequestException('No attachment file provided');
                    const folderType = type ?? 'course-attachments';
                    return this.courseService.uploadLectureAttachment(file, folderType);
                }


       @Post('/course-curriculum/:courseId')
            @ApiOperation({ summary: 'Add course modules and lectures' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
            @ApiBody({ description: 'Modules and lectures structure with uploaded video URLs', type: AddCourseCurriculumDto })
                async addCourseCurriculum( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string, currentRole: Role }, @Body() body: AddCourseCurriculumDto) {
                    return await this.courseService.addCourseCurriculum(courseId, body.modules!, user.userId, user.currentRole);
                }


        @Post('/course-pricing/:courseId')
            @ApiOperation({ summary: 'Add pricing and intro video to a course' })
            @ApiBody({ description: 'Pricing options and intro video URL', type: AddCoursePricingDto })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async addCoursePricing( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string, currentRole: Role }, @Body() dto: AddCoursePricingDto ) {
                    if (!dto.pricingOptions || !Array.isArray(dto.pricingOptions)) throw new BadRequestException('Invalid or missing pricingOptions')
                    return this.courseService.addCoursePricing(courseId, dto, user.userId, user.currentRole);
                }

        @Patch('/approve-changes/:courseId')        
            @ApiOperation({ summary: 'Admin: Approve pending changes for a course' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async approveCourseChanges( @Param('courseId') courseId: string/* , @CurrentUser() user: { userId: string, currentRole: Role } */) {
                    return this.courseService.approveCourseChanges(courseId/* , user.userId */);
                }

        @Patch('/course-availability/:courseId')
            @ApiOperation({ summary: 'Admin: Toggle course availability' })   
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
                async toggleCourseAvailability( @Param('courseId') courseId: string) {
                    return this.courseService.toggleCourseAvailability(courseId);
                }



        @Put('/submit/:courseId')
            @ApiOperation({ summary: 'Submit course for completion' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async submitCourse( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string, role: Role }) {
                    return this.courseService.submitCourse(courseId, user.userId, user.role );
                }

        @Get('/my-active-course')
            @ApiOperation({ summary: 'Fetch current active draft course (for continue editing)' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async getActiveCourse(@CurrentUser() user: { userId: string }) {
                    return this.courseService.getActiveCourse(user.userId);
                }

        @Get('/my-courses')
            @ApiOperation({ summary: 'Fetch my courses (Instructor POV)' })
            @ApiBearerAuth('jwt-auth')
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async myCourses(@PaginationQuery() pagination: PaginationDto, @CurrentUser() user: { userId: string }) {
                    return this.courseService.myCourses(pagination, user.userId);
                }

        @Delete('/deleteCourse/:courseId')
            @ApiOperation({ summary: 'Soft delete a course' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.INSTRUCTOR, Role.USER, Role.ADMIN)
                async deleteCourse( @CurrentUser() user: { userId: string }, @Param('courseId') courseId: string) {
                    return this.courseService.deleteCourse(user.userId, courseId );
                }

        @Get('/course-details/:courseId')
            @ApiOperation({ summary: 'Fetch courses details (Instructor POV)' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async myCoursesDetail(@Param('courseId') courseId: string, @CurrentUser() user: { userId: string }) {
                    return this.courseService.myCourseDetail(courseId, user.userId);
                }

        @Get('/view/:courseId')
            @ApiOperation({ summary: 'Get single course detail' })
                async getCourseDetails(@Param('courseId') courseId: string, @Query('userId') userId: string, @Req() req: any) {
                    return this.courseService.getCourseDetails(courseId, userId);
                }

        @Get('/allCourses')
            @ApiOperation({ summary: 'Get full courses details for Home page(Student POV)' })
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
            @ApiQuery({ name: 'type', required: false, enum: ['newcourse', 'toprated'], description: 'Filter by course type (newcourse = created today/yesterday, toprated = highest rated)'  })
            @ApiQuery({ name: 'search', required: false, type: String, description: 'Search courses by title' })
                async getAllCourses(@PaginationQuery() pagination: PaginationDto, @Query('type') type?: string, @Query('search') search?: string ) {
                    return this.courseService.getAllCourses(pagination, type, search);
                }

        @Post('/create/review')
            @ApiOperation({ summary: 'Add a review for a course' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.ADMIN)
                async createReview( @CurrentUser() user: { userId: string }, @Body() dto: CreateCourseReviewDto) {
                    return this.courseService.createReview(user.userId, dto);
                }

        @Get('/fetch/review/:courseId')
            @ApiOperation({ summary: 'Fetch course review' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.ADMIN)
                async fetchReview( @Param('courseId') courseId: string, @CurrentUser() user: { userId: string }) {
                    return this.courseService.fetchReview(courseId, user.userId);
                }

        @Delete('/deleteReview/:reviewId')
            @ApiOperation({ summary: 'Soft delete a course review' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.ADMIN)
                async deleteReview( @CurrentUser() user: { userId: string }, @Param('reviewId') reviewId: string) {
                    return this.courseService.deleteReview(user.userId, reviewId );
                }

        @Get('/reviews/instructor')
            @ApiOperation({ summary: 'Instructor: Get all reviews for all courses' })
            @ApiBearerAuth('jwt-auth')
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.INSTRUCTOR, Role.ADMIN)
                async getAllInstructorReviews(@PaginationQuery() pagination: PaginationDto, @CurrentUser() user: { userId: string }) {
                    return this.courseService.getAllReviewsForInstructor(pagination, user.userId);
                }

        @Post('/reply/:reviewId')
            @ApiOperation({ summary: 'Reply by Instructor for a review' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN, Role.INSTRUCTOR)
                async addReply( @Param('id') reviewId: string, @Body() dto: CreateInstructorReplyDto,  @CurrentUser() user: { userId: string }) {
                    return this.courseService.addReplyToReview(reviewId, dto, user.userId);
                }

}
