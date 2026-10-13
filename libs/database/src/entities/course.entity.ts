import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContentType } from 'libs/access/src/enums/course.enum';
import { Status, ApproximateDuration, PricingOption } from 'libs/access/src/enums/course.enum';

type LearningOutcome = string;


@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true  })
  approximateDuration?: string;

  @Column({ type: 'uuid', nullable: true  })
  categoryId?: string;

  @Column({ type: 'uuid', nullable: true  })
  subCategoryId?: string;

  @Column('uuid', { array: true, nullable: true })
  suggestedTags?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  customTags?: string[];

  @Column({ type: 'varchar', nullable: true })
  introVideoUrl?: string;

  @Column({ type: 'integer', default: 0 })
  introDuration? : number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  pricingOptions?: {
    option: PricingOption;
    price: number;
    description: string;
    stripePriceId?: string;
    razorpayPlanId?: string;
    paypalPlanId?: string;
  }[];

  @Column({ type: 'jsonb', nullable: false, default: [] })
  learningOutcomes?: LearningOutcome[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  curriculum?: {
      title: string;
      description?: string;
      order?: number;
      lectures: {
        id?: string;
        title: string;
        order?: number;
        contentType: ContentType;
        videoUrl?: string;
        fileUrl?: string;
        duration?: number;
        attachments?: {
            id?: string;
            name: string;
            fileUrl: string;
            fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx';
            uploadedAt?: Date;
        }[];
      }[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  draftData?: Partial<Course> | null;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true 
  })
  editStatus?: Status

  @Column({ type: 'boolean', default: false })
  hasPendingChanges?: boolean

  @Column({ type: 'boolean', default: true })
  courseAvailability?: boolean;

  @Column({ type: 'uuid', nullable: true })
  timeSpentId?: string;

  @Column({ type: 'uuid', nullable: false })
  creatorId?: string;

  @Column({ type: 'integer', default: 0 })
  totalReviews!: number;

  @Column({ type: 'float', default: 0 })
  averageRating!: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.DRAFT
  })
  status?: Status;

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
