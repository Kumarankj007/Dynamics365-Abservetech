import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from 'libs/access/src/enums/roles.enum';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name?: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email?: string;

  @Column({ type: 'varchar', nullable: false })
  password?: string;

  @Column({ type: 'varchar', nullable: false })
  phoneCode?: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.ADMIN] })
  role?: Role[];

  @Column({ type: 'enum', enum: Role, default: Role.ADMIN })
  currentRole?: Role;

  @Column({ type: 'varchar', nullable: true })
  profile?: string;

  @Column({ type: 'varchar', nullable: true })
  professionalTitle?: string; 

  @Column({ type: 'text', nullable: true })
  bio?: string; 

  @Column({ type: 'boolean', default: true })
  verified?: boolean; 

  @Column({ type: 'boolean', default: false })
  softDel?: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt?: Date;
}
