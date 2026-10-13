import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { UpdateSubscriptionStatusDto } from './dto/enrollments.dto';
import { PaymentStatus } from 'libs/access/src/enums/course.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

    async getAllEnrollmentsForAdmin(paginationDto: PaginationDto) {
      try {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        // Fetch paginated enrollments
        const [enrollments, total] = await this.enrollmentRepository.findAndCount({
          where: {
            paymentStatus: In([PaymentStatus.PAID/* , PaymentStatus.FAILED */])
          },
          skip,
          take: limit,
          order: { createdAt: 'DESC' },
        });

        if (!enrollments.length) return { status: false, statusCode: 200, message: 'No enrollments found', data: []}

        // Enrich enrollments with related data
        const enrichedData = await Promise.all(
          enrollments.map(async (enrollment) => {
            const [course, student, instructor] = await Promise.all([
              this.courseRepository.findOne({ where: { id: enrollment.courseId } }),
              this.userRepository.findOne({ where: { id: enrollment.userId } }),
              this.userRepository.findOne({ where: { id: enrollment.instructorId } }),
            ]);
            return {
              id: enrollment.id,
              courseTitle: course?.title || 'N/A',
              studentName: student ? student.fullname : 'N/A',
              instructorName: instructor ? instructor.fullname : 'N/A',
              studentEmail: student ? student.email : 'N/A',
              instructorEmail: instructor ? instructor.email : 'N/A',
              planType: enrollment.planType,
              basePrice: Number(enrollment.basePrice),
              taxPercentage: enrollment.taxPercentage ? Number(enrollment.taxPercentage) : 0,
              taxAmount: enrollment.taxAmount ? Number(enrollment.taxAmount) : 0,
              totalAmount: Number(enrollment.totalAmount),
              paymentMethod: enrollment.paymentMethod,
              paymentStatus: enrollment.paymentStatus,
              subscriptionStatus: enrollment.subscriptionStatus,
              nextBillingDate: enrollment.nextBillingDate,
              accessStartDate: enrollment.accessStartDate,
              accessEndDate: enrollment.accessEndDate,
              isRenewal: enrollment.isRenewal,
              progressPercentage: enrollment.progressPercentage,
              enrolledOn: enrollment.createdAt,
            };
          }),
        );

        return {
          status: true,
          statusCode: 200,
          message: 'Enrollments fetched successfully',
          data: {
            total,
            page,
            limit,
            data: enrichedData,
          },
        };
      } catch (error: any) {
        console.error('---------error', error);
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException ||
          error instanceof UnauthorizedException
        )
          throw error;
        throw new InternalServerErrorException(error.message);
      }
    }

    async updateSubscriptionStatus(id: string, dto: UpdateSubscriptionStatusDto) {
      try {
          const enrollment = await this.enrollmentRepository.findOne({ where: { id, softDel: false }});

          if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
          }

          enrollment.subscriptionStatus = dto.subscriptionStatus;

          await this.enrollmentRepository.save(enrollment);

          return {
            status: true,
            statusCode: 200,
            message: 'Subscription status updated successfully',
            enrollment,
          };
      } catch (error: any) {
          console.error('---------error', error);
          if (
            error instanceof NotFoundException ||
            error instanceof BadRequestException ||
            error instanceof UnauthorizedException
          )
            throw error;
          throw new InternalServerErrorException(error.message);
      }
    }
  }
