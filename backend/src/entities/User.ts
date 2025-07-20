/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Patient } from './Patient';
import { HealthMetric } from './HealthMetric';
import { AIPrediction } from './AIPrediction';
import { Appointment } from './Appointment';
import { Medication } from './Medication';
import { MedicalRecord } from './MedicalRecord';
import { Alert } from './Alert';

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  OFFICIAL = 'official',
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  userRole: string;
  isActive: boolean;
  first_name: string;
  last_name: string;
  password?: string;
}

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  userRole!: string;

  @Column({ type: 'varchar', length: 50 })
  first_name!: string;

  @Column({ type: 'varchar', length: 50 })
  last_name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hospital_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  license_number!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Health system relationships
  @OneToOne(() => Patient, (patient) => patient.user)
  patient!: Patient;

  @OneToMany(() => Patient, (patient) => patient.primary_doctor)
  patients!: Patient[];

  @OneToMany(() => HealthMetric, (metric) => metric.recorded_by_user)
  recorded_metrics!: HealthMetric[];

  @OneToMany(() => AIPrediction, (prediction) => prediction.reviewed_by_user)
  reviewed_predictions!: AIPrediction[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctor_appointments!: Appointment[];

  @OneToMany(() => Medication, (medication) => medication.prescribed_by_user)
  prescribed_medications!: Medication[];

  @OneToMany(() => MedicalRecord, (record) => record.doctor)
  medical_records!: MedicalRecord[];

  @OneToMany(() => Alert, (alert) => alert.read_by_user)
  read_alerts!: Alert[];
}
