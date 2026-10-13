import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { User } from 'libs/database/src/entities/user.entity';
import { Course } from 'libs/database/src/entities/course.entity';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { ApprovalQueue, ApprovalQueueStatus } from 'libs/database/src/entities/approval-queue.entity';
import { Payout, PayoutStatus } from 'libs/database/src/entities/payout.entity';
import { DashboardQueryDto, DashboardRange } from './dto/dashboard.dto';
import { Status, PaymentStatus } from 'libs/access/src/enums/course.enum';
import { Role } from 'libs/access/src/enums/roles.enum';
import dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(ApprovalQueue) private readonly approvalRepo: Repository<ApprovalQueue>,
    @InjectRepository(Payout) private readonly payoutRepo: Repository<Payout>,
  ) {}

  private parseRange(rangeDto: DashboardQueryDto) {
    const now = dayjs();
    let start: Date | null = null;
    let end: Date | null = null;

    const range = rangeDto.range ?? DashboardRange.THIS_MONTH;

    switch (range) {
      case DashboardRange.LIFETIME:
        return { start: null, end: null, range };
    
      case DashboardRange.THIS_MONTH:
        start = now.startOf('month').toDate();
        end = now.endOf('month').toDate();
        break;

      case DashboardRange.LAST_3_MONTHS:
        start = now.subtract(3, 'month').startOf('month').toDate();
        end = now.subtract(1, 'month').endOf('month').toDate();
        break;

      case DashboardRange.LAST_6_MONTHS:
        start = now.subtract(6, 'month').startOf('month').toDate();
        end = now.subtract(1, 'month').endOf('month').toDate();
        break;

      case DashboardRange.YTD:
        start = now.startOf('year').toDate();
        end = now.endOf('day').toDate();
        break;

      case DashboardRange.CUSTOM:
        if (rangeDto.fromDate && rangeDto.toDate) {
          start = dayjs(rangeDto.fromDate).startOf('day').toDate();
          end = dayjs(rangeDto.toDate).endOf('day').toDate();
        } else {
          start = now.startOf('month').toDate();
          end = now.endOf('month').toDate();
        }
        break;
    }

    return { start, end, range };
  }

  async getDashboard(query: DashboardQueryDto) {
    try {
      const { start, end, range } = this.parseRange(query);
      const isFiltered = range !== DashboardRange.LIFETIME;
        
      const studentFilter = isFiltered
        ? { currentRole: Role.USER, createdAt: Between(start, end) }
        : { currentRole: Role.USER };

      const instructorFilter = isFiltered
        ? { currentRole: Role.INSTRUCTOR, createdAt: Between(start, end) }
        : { currentRole: Role.INSTRUCTOR };

      const courseFilter = isFiltered
        ? { softDel: false, createdAt: Between(start, end) }
        : { softDel: false };

      const [totalStudents, totalInstructors, totalCourses] = await Promise.all([
        this.userRepo.count({ where: studentFilter }),
        this.userRepo.count({ where: instructorFilter }),
        this.courseRepo.count({ where: courseFilter }),
      ]);


      // Pending Payouts, Pending Approval Queues & Pending Reviews
      const pendingPayoutsCount = await this.payoutRepo.count({
        where: { status: In([PayoutStatus.REQUESTED, PayoutStatus.PROCESSING]) },
      });

      const pendingApprovalQueuecount = await this.approvalRepo.count({
        where: { status: ApprovalQueueStatus.PENDING },
      });
      
      const pendingCourseReviews = await this.courseRepo.count({
        where: { status: In([Status.DRAFT, Status.IN_REVIEW, ])  },
      });

      const pendingApprovalQueueAmountResult = await this.approvalRepo
        .createQueryBuilder("aq")
        .select(`
          COALESCE(SUM(aq."instructorAmount" + aq."platformAmount"), 0)
        `, "total")
        .where("aq.status = :status", { status: ApprovalQueueStatus.PENDING })
        .getRawOne();

      const pendingApprovalQueueAmount = Number(pendingApprovalQueueAmountResult.total || 0);
      
      const pendingPayoutAmountResult = await this.payoutRepo
        .createQueryBuilder("p")
        .select("COALESCE(SUM(p.amount), 0)", "total")
        .where("p.status IN (:...statuses)", {
          statuses: [PayoutStatus.REQUESTED, PayoutStatus.PROCESSING],
        })
        .getRawOne();
      
      const pendingPayoutAmount = Number(pendingPayoutAmountResult.total || 0);

      // NET REVENUE
      const netRevenueQuery = this.enrollRepo
        .createQueryBuilder('enroll')
        .select('COALESCE(SUM(enroll.totalAmount), 0)', 'net')
        .where('enroll.paymentStatus = :paid', { paid: PaymentStatus.PAID });

      if (isFiltered) {
        netRevenueQuery.andWhere('enroll.createdAt BETWEEN :start AND :end', {
          start,
          end,
        });
      }

      const netRevenueResult = await netRevenueQuery.getRawOne();
      const netRevenue = Number(netRevenueResult.net);

      //Monthly Revenue
      let monthlyStart = start;
      let monthlyEnd = end;

      if (!isFiltered) {
        monthlyStart = dayjs().subtract(5, 'month').startOf('month').toDate();
        monthlyEnd = dayjs().endOf('month').toDate();
      }

      const startMonth = dayjs(monthlyStart).startOf('month');
      const endMonth = dayjs(monthlyEnd).startOf('month');

      const months: { label: string; key: string; start: Date; end: Date }[] = [];
      let cursor = startMonth.clone();

      while (cursor.isBefore(endMonth) || cursor.isSame(endMonth)) {
        months.push({
          key: cursor.format('YYYY-MM'),
          label: cursor.format('MMM YYYY'),
          start: cursor.startOf('month').toDate(),
          end: cursor.endOf('month').toDate(),
        });
        cursor = cursor.add(1, 'month');
      }

      const monthlyRaw = await this.enrollRepo
        .createQueryBuilder('e')
        .select("date_trunc('month', e.createdAt)::date", 'month')
        .addSelect('COALESCE(SUM(e.totalAmount),0)', 'net')
        .where('e.paymentStatus = :paid', { paid: PaymentStatus.PAID })
        .andWhere('e.createdAt BETWEEN :start AND :end', {
          start: monthlyStart,
          end: monthlyEnd,
        })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      const monthlyMap = new Map<string, number>();
      for (const row of monthlyRaw) {
        monthlyMap.set(dayjs(row.month).format('YYYY-MM'), Number(row.net));
      }

      const monthlyRevenue = months.map(m => ({
        month: m.label,
        net: monthlyMap.get(m.key) || 0,
      }));

      const page = query.page || 1;
      const limit = query.limit || 6;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedMonthlyRevenue = monthlyRevenue.slice(startIndex, endIndex);

      return {
        status: true,
        message: 'DASHBOARD_DATA',
        data: {
          totalStudents,
          totalInstructors,
          totalCourses,
          netRevenue,
          pendingPayoutAmount,
          pendingPayoutsCount,
          pendingCourseReviews,
          pendingApprovalQueuecount,
          pendingApprovalQueueAmount,
          monthlyRevenue: paginatedMonthlyRevenue,
          totalMonths: monthlyRevenue.length,
        },
      };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
