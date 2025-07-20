// src/entities/AuditLog.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  entity!: string;

  @Column()
  action!: string;

  // Optional: Store a user id if available (e.g., from authentication context)
  @Column({ nullable: true })
  userId!: number;

  // Store details about the change (could be a JSON snapshot)
  @Column('longtext')
  data!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
