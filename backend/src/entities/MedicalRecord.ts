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

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'int' })
  doctor_id!: number;

  @Column({ type: 'varchar', length: 100 })
  record_type!: string;

  @Column({ type: 'text' })
  diagnosis!: string;

  @Column({ type: 'text', nullable: true })
  treatment!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'date' })
  record_date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Patient, (patient: Patient) => patient.medical_records)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => User, (user: User) => user.medical_records)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: User;
}
