/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIPrediction } from './AIPrediction';
import { Alert } from './Alert';
import { Appointment } from './Appointment';
import { HealthMetric } from './HealthMetric';
import { MedicalRecord } from './MedicalRecord';
import { Medication } from './Medication';
import { User } from './User';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  patient_id!: string;

  @Column({ type: 'int', nullable: true })
  user_id!: number;

  @Column({ type: 'varchar', length: 50 })
  first_name!: string;

  @Column({ type: 'varchar', length: 50 })
  last_name!: string;

  @Column({ type: 'date' })
  date_of_birth!: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender!: Gender;

  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
  })
  blood_type!: BloodType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact_name!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region!: string;

  @Column({ type: 'int', nullable: true })
  primary_doctor_id!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  insurance_number!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, (user: User) => user.patient)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => User, (user: User) => user.patients)
  @JoinColumn({ name: 'primary_doctor_id' })
  primary_doctor!: User;

  @OneToMany(() => HealthMetric, (metric: HealthMetric) => metric.patient)
  health_metrics!: HealthMetric[];

  @OneToMany(
    () => AIPrediction,
    (prediction: AIPrediction) => prediction.patient,
  )
  ai_predictions!: AIPrediction[];

  @OneToMany(
    () => Appointment,
    (appointment: Appointment) => appointment.patient,
  )
  appointments!: Appointment[];

  @OneToMany(() => Medication, (medication: Medication) => medication.patient)
  medications!: Medication[];

  @OneToMany(() => MedicalRecord, (record: MedicalRecord) => record.patient)
  medical_records!: MedicalRecord[];

  @OneToMany(() => Alert, (alert: Alert) => alert.patient)
  alerts!: Alert[];
}
