import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum PayoutStatus {
    REQUESTED = 'REQUESTED',
    PROCESSING = 'PROCESSING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('payouts')
export class Payout {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    requestId?: string;

    @Column({ type: 'uuid', nullable: false })
    userId?: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
    amount?: number;

    @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.REQUESTED })
    status?: PayoutStatus;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    availableToPay?: number;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    requestedAt?: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    paidAt?: Date;

    @Column({ type: 'text', nullable: true })
    description?: string;
}