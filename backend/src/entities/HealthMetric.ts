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

@Entity('health_metrics')
export class HealthMetric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'varchar', length: 50 })
  metric_type!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  systolic_pressure!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  diastolic_pressure!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_fasting!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_random!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hba1c!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  total_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  hdl_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  ldl_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  triglycerides!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  temperature_celsius!: number;

  @Column({ type: 'int', nullable: true })
  heart_rate!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  oxygen_saturation!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  alt_enzyme!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  ast_enzyme!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  creatinine!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  egfr!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'int', nullable: true })
  recorded_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Patient, (patient: Patient) => patient.health_metrics)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => User, (user: User) => user.recorded_metrics)
  @JoinColumn({ name: 'recorded_by' })
  recorded_by_user!: User;
}
