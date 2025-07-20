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

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'int' })
  prescribed_by!: number;

  @Column({ type: 'varchar', length: 100 })
  medication_name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dosage!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  frequency!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date', nullable: true })
  end_date!: Date;

  @Column({ type: 'text', nullable: true })
  instructions!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Patient, (patient: Patient) => patient.medications)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => User, (user: User) => user.prescribed_medications)
  @JoinColumn({ name: 'prescribed_by' })
  prescribed_by_user!: User;
}
