/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './Patient';
import { User } from './User';

export enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

@Entity('ai_predictions')
export class AIPrediction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'varchar', length: 50 })
  prediction_type!: string;

  @Column({
    type: 'enum',
    enum: RiskLevel,
  })
  risk_level!: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  risk_percentage!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  confidence_score!: number;

  @Column({ type: 'json', nullable: true })
  factors!: string[];

  @Column({ type: 'text', nullable: true })
  explanation!: string;

  @Column({ type: 'json', nullable: true })
  recommendations!: string[];

  @Column({ type: 'boolean', default: false })
  is_alert!: boolean;

  @Column({ type: 'boolean', default: false })
  is_reviewed!: boolean;

  @Column({ type: 'int', nullable: true })
  reviewed_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Patient, (patient: Patient) => patient.ai_predictions)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => User, (user: User) => user.reviewed_predictions)
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by_user!: User;
}
