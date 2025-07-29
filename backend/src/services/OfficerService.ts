import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient, Gender, BloodType } from '../entities/Patient';
import { User } from '../entities/User';
import { HealthMetric } from '../entities/HealthMetric';
import { AIPrediction } from '../entities/AIPrediction';
import { AppError } from '../utils/errors';
import { CreatePatientDto, CreateHealthMetricDto } from '../types';
import * as bcrypt from 'bcryptjs';

export interface DiseasePrevalence {
  diabetes: {
    currentRate: number;
    changeFromLastYear: number;
  };
  heartDisease: {
    currentRate: number;
    changeFromLastYear: number;
  };
  fattyLiver: {
    currentRate: number;
    changeFromLastYear: number;
  };
}

export interface DiseaseTrends {
  year: number;
  diabetes: number;
  heartDisease: number;
  fattyLiver: number;
  nationalAverage: number;
}

export interface OfficerDashboardData {
  diseasePrevalence: DiseasePrevalence;
  diseaseTrends: DiseaseTrends[];
  totalPatients: number;
  totalHealthMetrics: number;
  totalPredictions: number;
  regionalStats: Array<{
    region: string;
    count: number;
  }>;
}

export class OfficerService {
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;
  private healthMetricRepository: Repository<HealthMetric>;
  private aiPredictionRepository: Repository<AIPrediction>;

  constructor() {
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    this.aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
  }

  async getOfficerDashboard(): Promise<OfficerDashboardData> {
    try {
      // Get basic counts
      const [totalPatients, totalHealthMetrics, totalPredictions] = await Promise.all([
        this.patientRepository.count({ where: { is_active: true } }),
        this.healthMetricRepository.count(),
        this.aiPredictionRepository.count(),
      ]);

      // Calculate disease prevalence (simplified calculation)
      const diabetesPredictions = await this.aiPredictionRepository.count({
        where: { prediction_type: 'Type 2 Diabetes' }
      });
      const heartDiseasePredictions = await this.aiPredictionRepository.count({
        where: { prediction_type: 'Coronary Heart Disease' }
      });
      const fattyLiverPredictions = await this.aiPredictionRepository.count({
        where: { prediction_type: 'Fatty Liver Disease' }
      });

      const diseasePrevalence: DiseasePrevalence = {
        diabetes: {
          currentRate: totalPatients > 0 ? (diabetesPredictions / totalPatients) * 100 : 21.2,
          changeFromLastYear: 1.3
        },
        heartDisease: {
          currentRate: totalPatients > 0 ? (heartDiseasePredictions / totalPatients) * 100 : 16.8,
          changeFromLastYear: 0.7
        },
        fattyLiver: {
          currentRate: totalPatients > 0 ? (fattyLiverPredictions / totalPatients) * 100 : 13.5,
          changeFromLastYear: 1.8
        }
      };

      // Generate disease trends (simplified - using mock data)
      const diseaseTrends: DiseaseTrends[] = [
        { year: 2020, diabetes: 19.0, heartDisease: 15.0, fattyLiver: 11.0, nationalAverage: 15.0 },
        { year: 2021, diabetes: 20.0, heartDisease: 15.5, fattyLiver: 12.0, nationalAverage: 15.5 },
        { year: 2022, diabetes: 21.0, heartDisease: 16.0, fattyLiver: 12.5, nationalAverage: 16.0 },
        { year: 2023, diabetes: 22.0, heartDisease: 16.5, fattyLiver: 13.0, nationalAverage: 16.5 },
        { year: 2024, diabetes: 22.5, heartDisease: 17.0, fattyLiver: 13.5, nationalAverage: 17.0 },
        { year: 2025, diabetes: 23.0, heartDisease: 17.5, fattyLiver: 14.0, nationalAverage: 17.5 }
      ];

      // Get regional stats
      const regionalStats = await this.patientRepository
        .createQueryBuilder('patient')
        .select('patient.region', 'region')
        .addSelect('COUNT(*)', 'count')
        .where('patient.region IS NOT NULL')
        .andWhere('patient.is_active = :isActive', { isActive: true })
        .groupBy('patient.region')
        .getRawMany();

      return {
        diseasePrevalence,
        diseaseTrends,
        totalPatients,
        totalHealthMetrics,
        totalPredictions,
        regionalStats: regionalStats.map(item => ({
          region: item.region,
          count: parseInt(item.count)
        }))
      };
    } catch (error) {
      throw new AppError('Failed to get officer dashboard data', 500);
    }
  }

  async addPatient(patientData: CreatePatientDto, officerId: number): Promise<Patient> {
    try {
      // Create user account for patient
      const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
      const user = this.userRepository.create({
        name: patientData.patient_id,
        email: `${patientData.patient_id}@healthai.com`,
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        phone: patientData.emergency_contact,
        region: patientData.region,
        isActive: true
      });

      const savedUser = await this.userRepository.save(user);

      // Create patient record
      const patient = this.patientRepository.create({
        ...patientData,
        user_id: savedUser.id,
        is_active: true,
        gender: patientData.gender as Gender,
        blood_type: patientData.blood_type as BloodType,
        date_of_birth: new Date(patientData.date_of_birth)
      });

      return await this.patientRepository.save(patient);
    } catch (error) {
      throw new AppError('Failed to add patient', 500);
    }
  }

  async addHealthReport(healthData: CreateHealthMetricDto, officerId: number): Promise<HealthMetric> {
    try {
      const healthMetric = this.healthMetricRepository.create({
        ...healthData,
        recorded_by: officerId
      });

      return await this.healthMetricRepository.save(healthMetric);
    } catch (error) {
      throw new AppError('Failed to add health report', 500);
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      return await this.patientRepository.find({
        relations: ['user'],
        where: { is_active: true },
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new AppError('Failed to get patients', 500);
    }
  }

  async getPatientHealthReports(patientId: number): Promise<HealthMetric[]> {
    try {
      return await this.healthMetricRepository.find({
        where: { patient_id: patientId },
        relations: ['patient', 'recorded_by_user'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      throw new AppError('Failed to get patient health reports', 500);
    }
  }
} 