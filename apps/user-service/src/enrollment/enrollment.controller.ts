import { Body, Controller, Post, Get, Put, UseGuards, Param, UploadedFile, Query, HttpCode, Headers, Req, Delete, RawBody  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { FareEstimateDto, CreateEnrollmentDto, CheckPaymentStatusDto, UpdateProgressDto, AdminGrantAccessDto, CheckRazorpayPaymentDto, CheckPaypalPaymentDto } from './dto/enrollment.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { PaginationQuery } from 'libs/common/src/pagination/pagination.decorator'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { RolesGuard } from 'libs/access/src/guards/roles.guard';
import { Roles, CurrentUser } from 'libs/access/src/decorators/roles.decorator';
import { Role } from 'libs/access/src/enums/roles.enum';


@ApiTags('Enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    // private readonly uploadService: UploadService
) {}

        @Post('/fare-estimation')
            @ApiOperation({ summary: 'Fare Estimation' })
                async fareEstimation( @Body() dto: FareEstimateDto) {
                    return this.enrollmentService.fareEstimation(dto);
                }

        @Post('/create-payment-intent')
            @ApiOperation({ summary: 'Create Stripe Payment Intent for Enrollment' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async createPaymentIntent(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createStripePayment(dto, user.userId);
                }

        @Post('/admin-grant-access')        
            @ApiOperation({ summary: 'Admin Grant Access to Course' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.ADMIN)
            async adminGrantAccess(@Body() dto: AdminGrantAccessDto) {
                return this.enrollmentService.adminGrantAccess(dto)
            }

        @Post('/create-subscription')
            @ApiOperation({ summary: 'Create Stripe Subsciption ' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async createSubscription(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createStripeSubscription(dto, user.userId)
                }


        @Post('/check-payment-status')
            @ApiOperation({ summary: 'Create Stripe Payment Intent for Enrollment' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async checkPaymentStatus(@Body() dto: CheckPaymentStatusDto) {
                    return this.enrollmentService.checkStripePaymentStatus(dto);
              }

        @Post('/stripe/webhook')
        @HttpCode(200)
        async stripeWebhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {
            const rawBody = (req as any).rawBody ?? (req as any).body;
            return this.enrollmentService.handleStripeWebhook(rawBody, sig)
        }

        @Post('/create-razorpay-order')
            @ApiOperation({ summary: 'Create Razorpay Order for Enrollment' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async createRazorpayOrder(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createRazorpayPayment(dto, user.userId);
                }

        @Post('/create-razorpay-subscription')        
            @ApiOperation({ summary: 'Create Razorpay Subscription'})
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async createRazorpaySubscription(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createRazorpaySubscription(dto, user.userId)
                }

        @Post('/check-razorpay-payment-status')        
            @ApiOperation({ summary: 'Check Razorpay Payment Status' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async checkRazorpayPayment(@Body() dto: CheckRazorpayPaymentDto) {
                    return this.enrollmentService.checkRazorpayPaymentStatus(dto);
                }

        @Post('/razorpay/webhook')
        @HttpCode(200)
        async razorpayWebhook(@Req() req: Request, @Headers('x-razorpay-signature') signature: string) {
            const rawBody = (req as any).rawBody ?? (req as any).body;
            return this.enrollmentService.handleRazorpayWebhook(rawBody, signature)
        }

        @Post('/create-paypal-order')
            @ApiOperation({ summary: 'Create PayPal Order for Enrollment' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async createPaypalOrder(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createPaypalPayment(dto, user.userId);
                }

        @Post('/create-paypal-subscription')
            @ApiOperation({ summary: 'Create PayPal Subscription' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
                async createPaypalSubscription(@Body() dto: CreateEnrollmentDto, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.createPaypalSubscription(dto, user.userId)
                }

        @Post('/check-paypal-payment-status')
            @ApiOperation({ summary: 'Capture and verify a PayPal order' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles( Role.USER, Role.INSTRUCTOR, Role.ADMIN )
                async checkPaypalPayment(@Body() dto: CheckPaypalPaymentDto) {
                    return this.enrollmentService.checkPaypalPaymentStatus(dto);
                }

        @Post('/paypal/webhook')
        @HttpCode(200)
        async paypalWebhook(@Req() req: Request, @Body() body: any) {
            return this.enrollmentService.handlePaypalWebhook((req as any).headers, body)
        }

        @Delete('/cancel-subscription/:enrollmentId')
        @ApiBearerAuth('jwt-auth')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.USER, Role.INSTRUCTOR, Role.ADMIN)
        @ApiParam({ name: 'enrollmentId', description: 'EnrollmentId' })
        async deleteSubscription(@Param('enrollmentId') enrollmentId: string) {
            return this.enrollmentService.cancelSubscription(enrollmentId)
        }


        @Get('/my-courses')
            @ApiOperation({ summary: 'My Courses (Students)' })
            @ApiBearerAuth('jwt-auth')
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default: 10)' })
            @ApiQuery({ name: 'filter', required: false, enum: ['All', 'Active', 'Inactive', 'Lifetime'], example: 'Active', description: 'Filter courses by status (All, Active, Inactive, Lifetime)'})
            @Roles(Role.USER, Role.INSTRUCTOR)
            @UseGuards(JwtAuthGuard, RolesGuard)
                async myCourses(@PaginationQuery() pagination: PaginationDto, @Query('filter') filter: string, @CurrentUser() user: { userId: string }) {
                    return this.enrollmentService.getMyCourses(pagination, user.userId, filter);
                }

        @Get('/instructor')
            @ApiOperation({ summary: 'List all student enrollments for instructor’s courses' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR)
            @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
            @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
            @ApiQuery({ name: 'courseId', required: false, type: String, description: 'Filter by specific course' })
                async instructorEnrollments(@PaginationQuery() pagination: PaginationDto, @CurrentUser() instructor: { userId: string }, @Query('courseId') courseId?: string) {
                    return this.enrollmentService.getInstructorEnrollments(pagination, instructor.userId, courseId);
                }
        @Get('/view/:enrollmentId')
            @ApiOperation({ summary: 'View purchased course detail for student' })
            @ApiBearerAuth('jwt-auth')
            @ApiQuery({ name: 'search', required: false, type: String })
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR)
                async getPurchasedCourse( @Param('enrollmentId') enrollmentId: string, @CurrentUser() user: { userId: string }, @Query('search') search?: string, ) {
                    return this.enrollmentService.getPurchasedCourse(enrollmentId, user.userId, search );
                }
        

        @Put('/lectures/complete/:enrollmentId/:lectureId')
            @ApiOperation({ summary: 'Mark lecture as completed' })
            @ApiBearerAuth('jwt-auth')
            @UseGuards(JwtAuthGuard, RolesGuard)
            @Roles(Role.USER, Role.INSTRUCTOR)
                async markLectureComplete(@Param('enrollmentId') enrollmentId: string, @Param('lectureId') lectureId: string, @CurrentUser() userId: { userId: string }) {
                        return this.enrollmentService.markLectureComplete(enrollmentId, lectureId, userId.userId);
                }
}
