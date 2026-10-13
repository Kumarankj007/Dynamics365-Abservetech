import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export enum ApprovalQueueStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('approval-queue')
export class ApprovalQueue {
    @PrimaryGeneratedColumn('uuid')
    id?: string

    @Column({ type: 'uuid' })
    instructorId?: string

    @Column({ type: 'uuid' })
    courseId?: string

    @Column({ type: 'uuid' })
    buyerId?: string

    @Column({ type: "numeric", precision: 10, scale: 2 })
    instructorAmount?: number

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    platformAmount?: number

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    soldOn?: Date;

    @Column({ type: 'enum', enum: ApprovalQueueStatus, default: ApprovalQueueStatus.PENDING })
    status?: ApprovalQueueStatus
}