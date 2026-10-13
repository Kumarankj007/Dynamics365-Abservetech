import { Role } from 'libs/access/src/enums/roles.enum';
import { ReviewStatus } from 'libs/access/src/enums/course.enum';
import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('course_reviews')
export class CourseReview {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid', nullable: false })
  courseId!: string;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId' })
  user?: User

  @Column({ type: 'uuid', nullable: true })
  enrollmentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  review?: string;

  @Column({ type: 'int', default: 0 })
  rating!: number;

  @Column({ type: 'boolean', default: false })
  isReviewed!: boolean;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PUBLISHED})
  status!: ReviewStatus;

  @Column({ type: 'jsonb', nullable: true, default: () => `'[]'` })
  replies?: { userId: string;    
    userType: Role.ADMIN | Role.INSTRUCTOR;
    response: string;
    dateOfReview: string; 
  }[];

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
