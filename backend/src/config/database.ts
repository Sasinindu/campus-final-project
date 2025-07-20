// src/database.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './env';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { HealthMetric } from '../entities/HealthMetric';
import { MedicalRecord } from '../entities/MedicalRecord';
import { Medication } from '../entities/Medication';
import { Appointment } from '../entities/Appointment';
import { AIPrediction } from '../entities/AIPrediction';
import { Alert } from '../entities/Alert';
import { Attachment } from '../entities/Attachment';
import { AuditLog } from '../entities/AuditLog';
import { AuditSubscriber } from '../subscribers/AuditSubscriber';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  entities: [
    User,
    Patient,
    HealthMetric,
    MedicalRecord,
    Medication,
    Appointment,
    AIPrediction,
    Alert,
    Attachment,
    AuditLog,
  ],
  subscribers: [AuditSubscriber], // <-- Register the subscriber
  synchronize: true, // In production, use migrations instead
  logging: false,
});
