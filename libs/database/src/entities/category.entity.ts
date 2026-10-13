import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  category?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
