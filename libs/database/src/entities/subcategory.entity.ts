import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subcategories')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  subcategory?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: false  })
  categoryId?: string;

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
