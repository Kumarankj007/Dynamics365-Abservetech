import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('emailtemplates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  key?: string;

  @Column({ type: 'varchar', nullable: true })
  subject?: string;

  @Column({ type: 'varchar', nullable: true })
  body?: string; 
  
  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
