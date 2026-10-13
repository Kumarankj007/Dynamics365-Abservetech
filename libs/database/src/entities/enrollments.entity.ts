import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentStatus, PaymentMethod, PricingOption, SubscriptionStatus } from 'libs/access/src/enums/course.enum';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'uuid', nullable: false })
  instructorId!: string;

  @Column({ type: 'uuid', nullable: false })
  courseId!: string;

  @Column({ type: 'enum', enum: PricingOption, nullable: false })
  planType!: PricingOption;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  basePrice!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxPercentage?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount!: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.STRIPE })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId?: string;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId?: string;

  @Column({ type: 'varchar', nullable: true })
  razorpayOrderId?: string

  @Column({ type: 'varchar', nullable: true })
  razorpayPaymentId?: string

  @Column({ type: 'varchar', nullable: true })
  razorpaySubscriptionId?: string

  @Column({ type: 'varchar', nullable: true })
  paypalOrderId?: string

  @Column({ type: 'varchar', nullable: true })
  paypalSubscriptionId?: string

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.Inactive })
  subscriptionStatus?: string; 
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  nextBillingDate?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  accessStartDate?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  accessEndDate?: Date;

  @Column({ type: 'boolean', default: false })
  isRenewal?: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  completedLectures?: string[];

  @Column({ default: false })
  isCancelScheduled?: boolean

  @Column({ type: 'uuid', nullable: true })
  lastWatchedLectureId?: string;

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @Column({ type: 'int', default: 0 })
  progressPercentage?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
