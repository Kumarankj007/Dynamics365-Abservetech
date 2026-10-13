import { PaymentMethod, PaymentStatus, PricingOption, SubscriptionStatus } from "libs/access/src/enums/course.enum";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";


@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string

    @Column({ type: 'uuid', nullable: false })
    userId!: string

    @Column({ type: 'uuid' })
    enrollmentId?: string;

    /**
     * Gateway invoice / charge reference (e.g. Stripe invoice id `in_...`).
     * Used to make webhook processing idempotent so a renewal is recorded
     * exactly once even though Stripe delivers each event at-least-once.
     */
    @Index({ unique: true, where: '"gatewayInvoiceId" IS NOT NULL' })
    @Column({ type: 'varchar', nullable: true })
    gatewayInvoiceId?: string;

    @Column({ type: 'uuid', nullable: false })
    courseId!: string;

    @Column({ type: 'uuid', nullable: false })
    instructorId!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    totalAmount!: number;

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.STRIPE })
    paymentMethod!: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus!: PaymentStatus;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.Inactive })
    subscriptionStatus?: string; 

    @Column({ type: 'timestamp with time zone', nullable: true })
    accessStartDate?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    accessEndDate?: Date;

    @Column({ type: 'enum', enum: PricingOption, nullable: false })
    planType!: PricingOption;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt?: Date;
}