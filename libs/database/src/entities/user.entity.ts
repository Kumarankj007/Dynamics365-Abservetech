import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from 'libs/access/src/enums/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  fullname?: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email?: string;

  @Column({ type: 'varchar', nullable: false })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  profile?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  phoneCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
  role?: Role[];

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  currentRole?: Role;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'varchar', nullable: true })
  razorpayCustomerId?: string

  @Column({ type: 'float', default: 0, nullable: true })
  walletBalance?: number;

  @Column({ type: 'varchar', nullable: true })
  professionalTitle?: string; 

  @Column({ type: 'varchar', nullable: true })
  location?: string; 

  @Column({ type: 'varchar', nullable: true })
  website?: string; 

  @Column({ type: 'text', nullable: true })
  bio?: string; 

  @Column({ type: 'varchar', nullable: true })
  yearsOfExperience?: string; 

  @Column({ type: 'json', nullable: true })
  areasOfExpertise?: string[];

  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
