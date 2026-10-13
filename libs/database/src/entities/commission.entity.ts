import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';



type PremiumInstructorOverride = {
  instructorId: string;
  platformShare: number;
  instructorShare: number;
  effectiveFrom?: Date;
};

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  platformShareDefault?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  instructorShareDefault?: number;

  @Column({ type:'date', default: null })
  effectiveFrom?: Date;

  @Column({ type: 'jsonb', nullable: true })
  premiumInstructorOverrides?: PremiumInstructorOverride[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
