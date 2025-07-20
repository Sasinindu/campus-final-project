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

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'int' })
  doctor_id!: number;

  @Column({ type: 'datetime' })
  appointment_date!: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reason!: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Patient, (patient: Patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => User, (user: User) => user.doctor_appointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: User;
}
