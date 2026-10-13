import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  tag?: string; 

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
