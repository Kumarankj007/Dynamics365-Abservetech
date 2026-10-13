import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";

import { Course } from "libs/database/src/entities/course.entity";
import { Enrollment } from "libs/database/src/entities/enrollments.entity";
import { ApprovalQueue } from "libs/database/src/entities/approval-queue.entity";
import { CourseReview } from "libs/database/src/entities/course-review.entity";

import { Status } from "libs/access/src/enums/course.enum";
import { RevenuePaginationDto } from "./dto/dashboard.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,

    @InjectRepository(CourseReview)
    private readonly reviewRepo: Repository<CourseReview>,

    @InjectRepository(ApprovalQueue)
    private readonly approvalRepo: Repository<ApprovalQueue>
  ) {}

  async getDashboard(instructorId: string, pagination: RevenuePaginationDto) {
    const [published, drafts] = await Promise.all([
      this.courseRepo.count({
        where: { creatorId: instructorId, status: Status.PUBLISHED },
      }),
      this.courseRepo.count({
        where: {
          creatorId: instructorId,
          status: In([Status.DRAFT, Status.IN_REVIEW]),
        },
      }),
    ]);

    // Total Students
    const totalStudents = await this.enrollRepo
      .createQueryBuilder("en")
      .select("COUNT(DISTINCT en.userId)", "count")
      .where("en.instructorId = :instructorId", { instructorId })
      .andWhere("en.paymentStatus = :paid", { paid: "Paid" })
      .getRawOne();

    // Total Revenue
    const totals = await this.approvalRepo
      .createQueryBuilder("aq")
      .select(
        `
        SUM(
          COALESCE(aq."instructorAmount", 0)
        ) FILTER (WHERE aq.status IN ('APPROVED', 'PENDING'))
      `,
        "instructorRevenue"
      )
      .addSelect(
        `
        SUM(
          COALESCE(aq."platformAmount", 0)
        ) FILTER (WHERE aq.status IN ('APPROVED', 'PENDING'))
      `,
        "platformCommission"
      )
      .addSelect(
        `
        SUM(
          COALESCE(aq."instructorAmount", 0) + 
          COALESCE(aq."platformAmount", 0)
        ) FILTER (WHERE aq.status IN ('APPROVED', 'PENDING'))
      `,
        "totalSales"
      )
      .where("aq.instructorId = :instructorId", { instructorId })
      .getRawOne();

    // Average Rating
    const avgRating = await this.courseRepo
      .createQueryBuilder("c")
      .select("AVG(c.averageRating)", "rating")
      .where("c.creatorId = :instructorId", { instructorId })
      .andWhere("c.status = :status", { status: Status.PUBLISHED })
      .getRawOne();

    // Month-wise revenue (paginated)
    const monthWiseRevenue = await this.getMonthWiseRevenue(
      instructorId,
      pagination
    );

    return {
      status: true,
      statusCode: 200,
      message: "DASHBOARD_LISTED",
      data: {
        publishedCourses: published,
        draftCourses: drafts,
        totalRevenue: Number(totals?.instructorRevenue || 0),
        platformCommission: Number(totals?.platformCommission || 0),
        totalSales: Number(totals?.totalSales || 0),
        totalStudents: Number(totalStudents?.count || 0),
        averageRating: Number(avgRating?.rating || 0),
        monthWiseRevenue,
      }
    };
  }

  // PAGINATED MONTH-WISE REVENUE
  async getMonthWiseRevenue(
    instructorId: string,
    pagination: RevenuePaginationDto
  ) {
    let page = Number(pagination.page) || 1;
    let limit = Number(pagination.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await this.approvalRepo.query(
      `
    SELECT 
      TO_CHAR(aq."soldOn", 'FMMonth YYYY') AS month,
      DATE_TRUNC('month', aq."soldOn")::date AS sort_date,

      -- Revenue (instructor amount)
      SUM(CASE WHEN aq."status" IN ('APPROVED', 'PENDING') THEN aq."instructorAmount" ELSE 0 END)
        AS instructor_revenue,

      -- Platform commission
      SUM(CASE WHEN aq."status" IN ('APPROVED', 'PENDING') THEN aq."platformAmount" ELSE 0 END)
        AS platform_commission,

      -- Total sales = instructor + platform 
      SUM(
        CASE WHEN aq."status" IN ('APPROVED', 'PENDING') 
        THEN aq."instructorAmount" + aq."platformAmount"
        ELSE 0 END
      ) AS total_sales,

      -- Breakdown
      SUM(CASE WHEN aq."status" = 'APPROVED' THEN aq."instructorAmount" ELSE 0 END)
        AS approved_amount,

      SUM(CASE WHEN aq."status" = 'PENDING' THEN aq."instructorAmount" ELSE 0 END)
        AS pending_amount

    FROM "approval-queue" aq
    WHERE aq."instructorId" = $1
    GROUP BY month, sort_date
    ORDER BY sort_date DESC
    OFFSET $2 LIMIT $3
    `,
      [instructorId, offset, limit]
    );

    const countData = await this.approvalRepo.query(
      `
    SELECT COUNT(*) FROM (
      SELECT DATE_TRUNC('month', "soldOn")
      FROM "approval-queue"
      WHERE "instructorId" = $1
      GROUP BY DATE_TRUNC('month', "soldOn")
    ) t
    `,
      [instructorId]
    );

    return {
      total: Number(countData[0].count),
      page,
      limit,
      data: result.map((row: any) => ({
        month: row.month,
        instructorRevenue: Number(row.instructor_revenue),
        platformCommission: Number(row.platform_commission),
        totalSales: Number(row.total_sales),
        approvedAmount: Number(row.approved_amount),
        pendingAmount: Number(row.pending_amount),
      })),
    };
  }
}
