import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { TransactionsDto } from "./dto/transactions.dto";
import { Enrollment } from "libs/database/src/entities/enrollments.entity";
import { User } from "libs/database/src/entities/user.entity";
import { Course } from "libs/database/src/entities/course.entity";
import { Commission } from "libs/database/src/entities/commission.entity";
import { PaymentStatus } from "libs/access/src/enums/course.enum";
import { Transaction } from "libs/database/src/entities/transactions.entity";

export interface TransactionRow {
  id: string;
  studentName: string;
  instructorName: string;
  courseName: string;
  transactionDate: Date;
  paymentSource: string;
  // grossAmount: number;
  // fee: number;
  netAmount: number;
  nextRenewal: Date | null;
  status: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,

    @InjectRepository(Transaction)
    private readonly transacRepo: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>
  ) {}

  private mapPaymentStatus(uiStatus?: string): string | undefined {
    const map: Record<string, string | undefined> = {
      All: undefined,
      Completed: "Paid",
      Pending: "Pending",
      Failed: "Failed",
      Cancelled: "Cancelled",
      Declined: "Declined",
      Refunded: "Refunded",
    };
    return uiStatus ? map[uiStatus] : undefined;
  }

  private applyTransactionFilters(filter: TransactionsDto) {
    const qb = this.transacRepo.createQueryBuilder("t");

    if (filter.fromDate && filter.toDate) {
      qb.andWhere("t.createdAt BETWEEN :from AND :to", {
        from: new Date(filter.fromDate),
        to: new Date(filter.toDate),
      });
    }

    const dbStatus = this.mapPaymentStatus(filter.status);
    if (dbStatus) {
      qb.andWhere("t.paymentStatus = :status", { status: dbStatus });
    }

    if (filter.paymentSource && filter.paymentSource !== "All") {
      qb.andWhere("t.paymentMethod = :method", {
        method: filter.paymentSource,
      });
    }

    return qb;
  }

  private buildQuery(filter: TransactionsDto) {
    const qb = this.enrollRepo.createQueryBuilder("enrollment");

    if (filter.fromDate && filter.toDate) {
      qb.andWhere("enrollment.createdAt BETWEEN :from AND :to", {
        from: new Date(filter.fromDate),
        to: new Date(filter.toDate),
      });
    }

    const dbStatus = this.mapPaymentStatus(filter.status);
    if (dbStatus) {
      qb.andWhere("enrollment.paymentStatus = :status", { status: dbStatus });
    }

    if (filter.paymentSource && filter.paymentSource !== "All") {
      qb.andWhere("enrollment.paymentMethod = :method", {
        method: filter.paymentSource,
      });
    }

    if (filter.renewalMonth && filter.renewalMonth !== "All") {
      const [year, month] = filter.renewalMonth.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
      qb.andWhere("enrollment.nextBillingDate BETWEEN :start AND :end", {
        start: startDate,
        end: endDate,
      });
    }

    return qb;
  }

  async getAllForExport(filter: TransactionsDto): Promise<TransactionRow[]> {
    try {
      const qb = this.buildQuery(filter);
      const rows = await qb.orderBy("enrollment.createdAt", "DESC").getMany();

      if (!rows.length) return [];

      const userIds = rows.flatMap((r) => [r.userId, r.instructorId]);
      const courseIds = rows.map((r) => r.courseId);

      const users = await this.userRepo.find({ where: { id: In(userIds) } });
      const courses = await this.courseRepo.find({
        where: { id: In(courseIds) },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      const courseMap = new Map(courses.map((c) => [c.id, c]));

      return rows.map((e) => {
        const student = userMap.get(e.userId);
        const instructor = userMap.get(e.instructorId);
        const course = courseMap.get(e.courseId);

        // const gross = Number(e.totalAmount || 0);
        // const fee = 0;
        // const net = gross - fee;

        const net = Number(e.totalAmount);

        return {
          id: e.id!,
          studentName: student?.fullname ?? "N/A",
          instructorName: instructor?.fullname ?? "N/A",
          courseName: course?.title ?? "N/A",
          transactionDate: e.createdAt!,
          paymentSource: e.paymentMethod ?? "N/A",
          // grossAmount: gross,
          // fee,
          netAmount: net,
          nextRenewal: e.nextBillingDate ?? null,
          status: e.paymentStatus ?? "N/A",
        };
      });
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // async getTransactions(query: TransactionsDto) {
  //   const page = Number(query.page) || 1;
  //   const limit = Number(query.limit) || 10;

  //   const qb = this.buildQuery(query);

  //   qb.skip((page - 1) * limit)
  //     .take(limit)
  //     .orderBy("enrollment.createdAt", "DESC");

  //   const [rows, total] = await qb.getManyAndCount();

  //   if (!rows.length) {
  //     return {
  //       status: true,
  //       message: "TRANSACTIONS_LISTED",
  //       total: 0,
  //       data: [],
  //       totalNetAmount: 0,
  //       paidCount: 0,
  //       failedCount: 0,
  //     };
  //   }

  //   const userIds = rows.flatMap((r) => [r.userId, r.instructorId]);
  //   const courseIds = rows.map((r) => r.courseId);

  //   const users = await this.userRepo.findBy({ id: In(userIds) });
  //   const courses = await this.courseRepo.findBy({ id: In(courseIds) });

  //   const userMap = new Map(users.map((u) => [u.id, u]));
  //   const courseMap = new Map(courses.map((c) => [c.id, c]));

  //   // const commission = await this.commissionRepo.findOne({ where: {} });
  //   // const platformDefault = Number(commission?.platformShareDefault ?? 0);

  //   // const overrides = commission?.premiumInstructorOverrides ?? [];
  //   // const overrideMap = new Map(overrides.map((o) => [o.instructorId, o]));

  //   const paidCountQuery = this.buildQuery(query);
  //   paidCountQuery.andWhere("enrollment.paymentStatus = :status", {
  //     status: PaymentStatus.PAID,
  //   });
  //   const paidCount = await paidCountQuery.getCount();

  //   const failedCountQuery = this.buildQuery(query);
  //   failedCountQuery.andWhere("enrollment.paymentStatus = :status", {
  //     status: PaymentStatus.FAILED,
  //   });
  //   const failedCount = await failedCountQuery.getCount();

  //   let totalNetAmount = 0;

  //   const data = rows.map((e) => {
  //     const student = userMap.get(e.userId);
  //     const instructor = userMap.get(e.instructorId);
  //     const course = courseMap.get(e.courseId);

  //     // const gross = Number(e.totalAmount);

  //     // const override = overrideMap.get(e.instructorId);

  //     // const platformShare = override
  //     //   ? Number(override.platformShare)
  //     //   : platformDefault;

  //     // const fee = (gross * platformShare) / 100;
  //     // const net = gross - fee;

  //     const net = Number(e.totalAmount);

  //     if (e.paymentStatus === PaymentStatus.PAID) {
  //       totalNetAmount += net;
  //     }

  //     return {
  //       id: e.id,
  //       studentName: student?.fullname || "",
  //       studentEmail: student?.email || "",
  //       instructorName: instructor?.fullname || "",
  //       courseTitle: course?.title || "",
  //       paymentSource: e.paymentMethod,
  //       status: e.paymentStatus,
  //       // grossAmount: gross,
  //       // fee,
  //       netAmount: net,
  //       nextRenewal: e.nextBillingDate,
  //       createdAt: e.createdAt,
  //     };
  //   });

  //   return {
  //     status: true,
  //     message: "TRANSACTIONS_LISTED",
  //     total,
  //     page,
  //     limit,
  //     data,
  //     totalNetAmount,
  //     paidCount,
  //     failedCount,
  //   };
  // }

  async getTransactions(query: TransactionsDto) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  /**
   * ✅ STEP 1: FETCH FROM BOTH TABLES IN PARALLEL
   */
  const [transactions, enrollments] = await Promise.all([
    this.applyTransactionFilters(query).getMany(),
    this.buildQuery(query).getMany(),
  ]);

  /**
   * ✅ STEP 2: DEDUPLICATE
   * Remove enrollments that already exist as a transaction row
   */
  const transactionEnrollmentIds = new Set(
    transactions.map((t) => t.enrollmentId)
  );

  const filteredEnrollments = enrollments.filter(
    (e) => !transactionEnrollmentIds.has(e.id)
  );

  /**
   * ✅ STEP 3: NORMALIZE & MERGE
   */
  const combined = [
    ...transactions.map((t) => ({
      id: t.id,
      enrollmentId: t.enrollmentId,
      userId: t.userId,
      courseId: t.courseId,
      instructorId: t.instructorId,
      totalAmount: t.totalAmount,
      paymentMethod: t.paymentMethod,
      paymentStatus: t.paymentStatus,
      subscriptionStatus: t.subscriptionStatus,
      planType: t.planType,
      nextBillingDate: undefined,
      createdAt: t.createdAt,
    })),
    ...filteredEnrollments.map((e) => ({
      id: `legacy-${e.id}`,
      enrollmentId: e.id,
      userId: e.userId,
      courseId: e.courseId,
      instructorId: e.instructorId,
      totalAmount: e.totalAmount,
      paymentMethod: e.paymentMethod,
      paymentStatus: e.paymentStatus,
      subscriptionStatus: e.subscriptionStatus,
      planType: e.planType,
      nextBillingDate: e.nextBillingDate,
      createdAt: e.createdAt,
    })),
  ];

  /**
   * ✅ STEP 4: SORT (latest first)
   */
  const sorted = combined.sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
  );

  /**
   * ✅ STEP 5: AGGREGATE COUNTS & TOTALS (from full merged set)
   */
  const total = sorted.length;

  const paidCount = sorted.filter(
    (r) => r.paymentStatus === PaymentStatus.PAID
  ).length;

  const failedCount = sorted.filter(
    (r) => r.paymentStatus === PaymentStatus.FAILED
  ).length;

  const totalNetAmount = sorted
    .filter((r) => r.paymentStatus === PaymentStatus.PAID)
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  if (!total) {
    return {
      status: true,
      message: "TRANSACTIONS_LISTED",
      total: 0,
      page,
      limit,
      data: [],
      totalNetAmount: 0,
      paidCount: 0,
      failedCount: 0,
    };
  }

  /**
   * ✅ STEP 6: PAGINATE
   */
  const paginated = sorted.slice((page - 1) * limit, page * limit);

  /**
   * ✅ STEP 7: FETCH RELATED DATA (users & courses for current page only)
   */
  const userIds = paginated.flatMap((r) => [r.userId, r.instructorId]);
  const courseIds = paginated.map((r) => r.courseId);

  const [users, courses] = await Promise.all([
    this.userRepo.findBy({ id: In(userIds) }),
    this.courseRepo.findBy({ id: In(courseIds) }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  /**
   * ✅ STEP 8: FORMAT FINAL RESPONSE
   */
  const data = paginated.map((e) => {
    const student = userMap.get(e.userId);
    const instructor = userMap.get(e.instructorId);
    const course = courseMap.get(e.courseId);

    return {
      id: e.id,
      studentName: student?.fullname || "",
      studentEmail: student?.email || "",
      instructorName: instructor?.fullname || "",
      courseTitle: course?.title || "",
      paymentSource: e.paymentMethod,
      status: e.paymentStatus,
      netAmount: Number(e.totalAmount || 0),
      nextRenewal: e.nextBillingDate,
      createdAt: e.createdAt,
    };
  });

  return {
    status: true,
    message: "TRANSACTIONS_LISTED",
    total,
    page,
    limit,
    data,
    totalNetAmount,
    paidCount,
    failedCount,
  };
}
}
