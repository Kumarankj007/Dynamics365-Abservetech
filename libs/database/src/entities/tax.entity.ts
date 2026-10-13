import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax')
export class Tax {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  tax?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
