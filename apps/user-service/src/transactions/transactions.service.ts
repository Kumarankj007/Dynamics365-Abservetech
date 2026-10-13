import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Enrollment } from "libs/database/src/entities/enrollments.entity";
import { User } from "libs/database/src/entities/user.entity";
import { Course } from "libs/database/src/entities/course.entity";
import { UserTransactionsDto, TransactionDateRange,} from "./dto/transactions.dto";
import { PaymentStatus, PricingOption } from "libs/access/src/enums/course.enum";
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { Transaction } from "libs/database/src/entities/transactions.entity";

export interface UserTransactionRow {
  date: Date;
  item: string;
  pricingOption: string;
  amount: number;
  paymentMethod: string;
  instructorName: string;
  receiptUrl: string;
}

@Injectable()
export class UserTransactionsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(Transaction)
    private readonly transacRepo: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>
  ) {}

  private getPricingLabel(option: PricingOption | string): string {
    const map = {
      "1_MONTH": "Monthly Subscription",
      "6_MONTHS": "Half-Year Subscription",
      "1_YEAR": "Yearly Subscription",
      LIFETIME: "Lifetime",
    };
    if ((option as keyof typeof map) in map) {
      return map[option as keyof typeof map];
    }
    return option;
  }

  private getDateRangeFilter(dateRange: TransactionDateRange) {
    const now = new Date();
    let start: Date | undefined;
    let end: Date = now;

    switch (dateRange) {
      case TransactionDateRange.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case TransactionDateRange.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case TransactionDateRange.LAST_3_MONTHS:
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        start = undefined;
    }

    return start ? { start, end } : null;
  }

  // async getTransactions(userId: string, filter: UserTransactionsDto) {
  //   try {
  //     const page = filter.page || 1;
  //     const limit = filter.limit || 10;

  //     const qb = this.enrollRepo.createQueryBuilder("enrollment");
  //     qb.where("enrollment.userId = :userId", { userId });

  //     qb.andWhere("enrollment.paymentStatus IN (:...statuses)", {
  //       statuses: [PaymentStatus.PAID, PaymentStatus.FAILED]
  //     })

  //     const range = this.getDateRangeFilter(
  //       filter.dateRange || TransactionDateRange.ALL_TIME
  //     );
  //     if (range) {
  //       qb.andWhere("enrollment.createdAt BETWEEN :start AND :end", {
  //         start: range.start,
  //         end: range.end,
  //       });
  //     }

  //     qb.orderBy("enrollment.createdAt", "DESC")
  //       .skip((page - 1) * limit)
  //       .take(limit);

  //     const [rows, total] = await qb.getManyAndCount();

  //     if (!rows.length) {
  //       return {
  //         status: true,
  //         message: "USER_TRANSACTIONS_LISTED",
  //         total: 0,
  //         page,
  //         limit,
  //         data: [],
  //       };
  //     }

  //     const courseIds = rows.map((r) => r.courseId);
  //     const courses = await this.courseRepo.find({
  //       where: { id: In(courseIds) },
  //     });
  //     const courseMap = new Map(courses.map((c) => [c.id, c]));

  //     const instructorIds = rows.map((r) => r.instructorId);
  //     const instructors = await this.userRepo.find({
  //       where: { id: In(instructorIds) },
  //     });
  //     const instructorMap = new Map(instructors.map((i) => [i.id, i]));

  //     const data: UserTransactionRow[] = rows.map((e) => {
  //       const course = courseMap.get(e.courseId);
  //       const instructor = instructorMap.get(e.instructorId);

  //       const option = e.planType;
  //       const pricingLabel = this.getPricingLabel(option);

  //       return {
  //         ...e,
  //         date: e.createdAt!,
  //         item: course?.title || "N/A",
  //         pricingOption: pricingLabel,
  //         amount: Number(e.totalAmount || 0),
  //         paymentMethod: e.paymentMethod || "N/A",
  //         instructorName: instructor?.fullname || "N/A",
  //         receiptUrl: `/transactions/${e.id}/receipt`,
  //         enrollmentId: e.id,
  //         paymentStatus: e.paymentStatus,
  //         subscriptionStatus:e.subscriptionStatus
  //       };
  //     });

  //     return {
  //       status: true,
  //       message: "USER_TRANSACTIONS_LISTED",
  //       total,
  //       page,
  //       limit,
  //       data,
  //     };
  //   } catch (e: any) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  async getTransactions(userId: string, filter: UserTransactionsDto) {
    try {
      const page = filter.page || 1;
      const limit = filter.limit || 10;

      const range = this.getDateRangeFilter(
        filter.dateRange || TransactionDateRange.ALL_TIME
      );

      /**
       * ✅ STEP 1: FETCH TRANSACTIONS
       */
      const transactionQb =
        this.transacRepo.createQueryBuilder("t");

      transactionQb.where("t.userId = :userId", { userId });

      transactionQb.andWhere("t.paymentStatus IN (:...statuses)", {
        statuses: [PaymentStatus.PAID, PaymentStatus.FAILED],
      });

      if (range) {
        transactionQb.andWhere("t.createdAt BETWEEN :start AND :end", {
          start: range.start,
          end: range.end,
        });
      }

      const transactions = await transactionQb.getMany();

      /**
       * ✅ STEP 2: FETCH OLD ENROLLMENTS
       */
      const enrollmentQb = this.enrollRepo.createQueryBuilder("e");

      enrollmentQb.where("e.userId = :userId", { userId });

      enrollmentQb.andWhere("e.paymentStatus IN (:...statuses)", {
        statuses: [PaymentStatus.PAID, PaymentStatus.FAILED],
      });

      if (range) {
        enrollmentQb.andWhere("e.createdAt BETWEEN :start AND :end", {
          start: range.start,
          end: range.end,
        });
      }

      const enrollments = await enrollmentQb.getMany();

      /**
       * ⚠️ STEP 3: REMOVE DUPLICATES
       * (if first payment exists in both tables)
       */
      const transactionEnrollmentIds = new Set(
        transactions.map((t) => t.enrollmentId)
      );

      const filteredEnrollments = enrollments.filter(
        (e) => !transactionEnrollmentIds.has(e.id)
      );

      /**
       * ✅ STEP 4: MERGE BOTH
       */
      const combined = [
        ...transactions.map((t) => ({
          id: t.id,
          enrollmentId: t.enrollmentId,
          courseId: t.courseId,
          instructorId: t.instructorId,
          totalAmount: t.totalAmount,
          paymentMethod: t.paymentMethod,
          paymentStatus: t.paymentStatus,
          subscriptionStatus: t.subscriptionStatus,
          planType: t.planType,
          createdAt: t.createdAt,
        })),

        ...filteredEnrollments.map((e) => ({
          id: `legacy-${e.id}`,
          enrollmentId: e.id,
          courseId: e.courseId,
          instructorId: e.instructorId,
          totalAmount: e.totalAmount,
          paymentMethod: e.paymentMethod,
          paymentStatus: e.paymentStatus,
          subscriptionStatus: e.subscriptionStatus,
          planType: e.planType,
          createdAt: e.createdAt,
        })),
      ];

      /**
       * ✅ STEP 5: SORT (LATEST FIRST)
       */
      const sorted = combined.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
      );

      /**
       * ✅ STEP 6: PAGINATION
       */
      const total = sorted.length;

      const paginated = sorted.slice(
        (page - 1) * limit,
        page * limit
      );

      /**
       * ✅ STEP 7: FETCH RELATED DATA
       */
      const courseIds = paginated.map((r) => r.courseId);
      const instructorIds = paginated.map((r) => r.instructorId);

      const [courses, instructors] = await Promise.all([
        this.courseRepo.find({ where: { id: In(courseIds) } }),
        this.userRepo.find({ where: { id: In(instructorIds) } }),
      ]);

      const courseMap = new Map(courses.map((c) => [c.id, c]));
      const instructorMap = new Map(instructors.map((i) => [i.id, i]));

      /**
       * ✅ STEP 8: FINAL RESPONSE FORMAT
       */
      const data: UserTransactionRow[] = paginated.map((e) => {
        const course = courseMap.get(e.courseId);
        const instructor = instructorMap.get(e.instructorId);

        return {
          ...e,
          date: e.createdAt || new Date(),
          item: course?.title || "N/A",
          pricingOption: this.getPricingLabel(e.planType),
          amount: Number(e.totalAmount || 0),
          paymentMethod: e.paymentMethod || "N/A",
          instructorName: instructor?.fullname || "N/A",
          receiptUrl: `/transactions/${e.enrollmentId}/receipt`,
          enrollmentId: e.enrollmentId,
          paymentStatus: e.paymentStatus,
          subscriptionStatus: e.subscriptionStatus,
        };
      });

      return {
        status: true,
        message: "USER_TRANSACTIONS_LISTED",
        total,
        page,
        limit,
        data,
      };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }
  
  async generateReceiptPdf( currentUserId: string, enrollmentId: string ): Promise<Buffer> {
    const enrollment = await this.enrollRepo.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) throw new NotFoundException("Enrollment not found");

    const course = await this.courseRepo.findOne({
      where: { id: enrollment.courseId },
    });

    // const instructor = await this.userRepo.findOne({
    //   where: { id: enrollment.instructorId },
    // });

    const user = await this.userRepo.findOne({
      where: { id: enrollment.userId },
    });

    // PDF Template
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const COLORS = {
        primary: "#3A57E8",
        textDark: "#111827",
        textLight: "#6B7280",
        tableHeaderBg: "#F3F4F6",
        border: "#E5E7EB",
      };

      // HEADER
      doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary);

      doc
        .fill("#FFFFFF")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("INVOICE", 40, 30);

      doc.moveDown(2);

      // INVOICE METADATA
      doc.fontSize(12).fill(COLORS.textDark).font("Helvetica-Bold");
      doc.text("Invoice Details");

      doc.font("Helvetica").fill(COLORS.textLight).fontSize(10);
      doc.text(`Invoice ID: ${enrollment.id}`);
      doc.text(
        `Date: ${dayjs(enrollment.createdAt).format("DD MMM YYYY, hh:mm A")}`
      );
      doc.text(`Payment Method: ${enrollment.paymentMethod}`);

      doc.moveDown(1);

      // USER DETAILS
      doc.fontSize(12).fill(COLORS.textDark).font("Helvetica-Bold");
      doc.text("Billing To");

      doc.fontSize(10).fill(COLORS.textLight).font("Helvetica");
      doc.text(`Name: ${user?.fullname}` || "N/A");
      doc.text(`Email: ${user?.email}` || "N/A");

      doc.moveDown(2);

      // TABLE HEADER
      const startY = doc.y;

      doc.rect(40, startY, 520, 30).fill(COLORS.tableHeaderBg);

      doc
        .fill(COLORS.textDark)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Title", 50, startY + 8)
        .text("Source", 260, startY + 8)
        .text("Amount", 450, startY + 8);

      const rowY = startY + 35;

      // TABLE ROW
      doc
        .fill("#000000")
        .font("Helvetica")
        .fontSize(10)
        .text(course?.title || "Course", 50, rowY, {width: 200})
        .text(enrollment.paymentMethod, 260, rowY)
        .text(`${enrollment.totalAmount}`, 450, rowY);

      doc.moveDown(4);

      doc.fontSize(14).font("Helvetica-Bold");
      doc.text("Thank you for your purchase!", 0, doc.y, {
        align: "center",
        width: doc.page.width,
      });

      doc.y = doc.page.height - 70;

      doc.fontSize(9)
        .fillColor(COLORS.textLight)
        .text(
          "This is a system-generated invoice and does not require a signature.",
          0,
        doc.y,
        {
          align: "center",
          width: doc.page.width,
        }
      );

      doc.end();
    });
  }
}
