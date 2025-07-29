import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import { HealthMetric } from '../entities/HealthMetric';
import { AIPrediction } from '../entities/AIPrediction';
import { Appointment } from '../entities/Appointment';
import { AppError } from '../utils/errors';

export interface RecentPatient {
  id: number;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  primary_condition: string;
  last_visit: string;
  risk_level: 'low' | 'moderate' | 'high';
  ai_alert: boolean;
  recent_metrics: any[];
  upcoming_appointments: any[];
}

export interface DoctorPatientFilters {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: string;
  hasAlerts?: boolean;
}

export class DoctorPatientService {
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;
  private healthMetricRepository: Repository<HealthMetric>;
  private aiPredictionRepository: Repository<AIPrediction>;
  private appointmentRepository: Repository<Appointment>;

  constructor() {
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    this.aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    this.appointmentRepository = AppDataSource.getRepository(Appointment);
  }

  async getRecentPatients(doctorId: number, filters: DoctorPatientFilters = {}): Promise<RecentPatient[]> {
    try {
      const { page = 1, limit = 10, search, riskLevel, hasAlerts } = filters;
      const skip = (page - 1) * limit;

      // Build query for all patients (not just assigned to this doctor)
      const queryBuilder = this.patientRepository
        .createQueryBuilder('patient')
        .leftJoinAndSelect('patient.user', 'user')
        .where('patient.is_active = :isActive', { isActive: true });

      // Add search filter
      if (search) {
        queryBuilder.andWhere(
          '(patient.first_name LIKE :search OR patient.last_name LIKE :search OR patient.patient_id LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add risk level filter
      if (riskLevel && riskLevel !== 'all') {
        queryBuilder.andWhere('patient.risk_level = :riskLevel', { riskLevel });
      }

      // Add alerts filter
      if (hasAlerts !== undefined && hasAlerts !== null) {
        if (hasAlerts === true) {
          queryBuilder.andWhere('EXISTS (SELECT 1 FROM ai_predictions ap WHERE ap.patient_id = patient.id AND ap.is_alert = true)');
        } else if (hasAlerts === false) {
          queryBuilder.andWhere('NOT EXISTS (SELECT 1 FROM ai_predictions ap WHERE ap.patient_id = patient.id AND ap.is_alert = true)');
        }
      }

      // Order by last activity (most recent first)
      queryBuilder.orderBy('patient.updated_at', 'DESC');

      const patients = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      // Enrich patient data with additional information
      const enrichedPatients = await Promise.all(
        patients.map(async (patient) => {
          const age = this.calculateAge(patient.date_of_birth);
          const primaryCondition = await this.getPrimaryCondition(patient.id);
          const lastVisit = await this.getLastVisit(patient.id);
          const riskLevel = await this.calculateRiskLevel(patient.id);
          const aiAlert = await this.hasAIAlert(patient.id);
          const recentMetrics = await this.getRecentMetrics(patient.id);
          const upcomingAppointments = await this.getUpcomingAppointments(patient.id);

          return {
            id: patient.id,
            patient_id: patient.patient_id,
            name: `${patient.last_name}, ${patient.first_name}`,
            age,
            gender: patient.gender,
            primary_condition: primaryCondition,
            last_visit: lastVisit,
            risk_level: riskLevel,
            ai_alert: aiAlert,
            recent_metrics: recentMetrics,
            upcoming_appointments: upcomingAppointments,
          };
        })
      );

      return enrichedPatients;
    } catch (error) {
      throw new AppError('Failed to get recent patients', 500);
    }
  }

  async getPatientById(patientId: number): Promise<RecentPatient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['user'],
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      const age = this.calculateAge(patient.date_of_birth);
      const primaryCondition = await this.getPrimaryCondition(patient.id);
      const lastVisit = await this.getLastVisit(patient.id);
      const riskLevel = await this.calculateRiskLevel(patient.id);
      const aiAlert = await this.hasAIAlert(patient.id);
      const recentMetrics = await this.getRecentMetrics(patient.id);
      const upcomingAppointments = await this.getUpcomingAppointments(patient.id);

      return {
        id: patient.id,
        patient_id: patient.patient_id,
        name: `${patient.last_name}, ${patient.first_name}`,
        age,
        gender: patient.gender,
        primary_condition: primaryCondition,
        last_visit: lastVisit,
        risk_level: riskLevel,
        ai_alert: aiAlert,
        recent_metrics: recentMetrics,
        upcoming_appointments: upcomingAppointments,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get patient', 500);
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private async getPrimaryCondition(patientId: number): Promise<string> {
    try {
      // Get the most recent AI prediction to determine primary condition
      const prediction = await this.aiPredictionRepository.findOne({
        where: { patient_id: patientId },
        order: { created_at: 'DESC' },
      });

      if (prediction && prediction.factors && prediction.factors.length > 0) {
        // Use the first identified factor as primary condition
        const primaryFactor = prediction.factors[0];
        
        // Map common factors to meaningful condition names
        const conditionMap: { [key: string]: string } = {
          'hypertension': 'Hypertension',
          'hyperlipidemia': 'High Cholesterol',
          'diabetes': 'Diabetes',
          'obesity': 'Obesity',
          'cardiovascular disease': 'Heart Disease',
          'respiratory issues': 'Respiratory Condition',
          'liver disease': 'Liver Condition',
          'kidney disease': 'Kidney Condition',
          'osteoporosis': 'Osteoporosis',
          'arthritis': 'Arthritis',
          'anemia': 'Anemia',
          'thyroid disorder': 'Thyroid Disorder',
          'depression': 'Mental Health',
          'anxiety': 'Mental Health',
          'asthma': 'Asthma',
          'copd': 'COPD',
          'sleep apnea': 'Sleep Apnea',
          'gastrointestinal': 'Digestive Issues',
          'migraine': 'Migraine',
          'chronic pain': 'Chronic Pain'
        };

        // Check for exact matches first
        for (const [key, value] of Object.entries(conditionMap)) {
          if (primaryFactor.toLowerCase().includes(key.toLowerCase())) {
            return value;
          }
        }

        // If no exact match, return a capitalized version of the factor
        return primaryFactor.charAt(0).toUpperCase() + primaryFactor.slice(1);
      }

      // Fallback to most recent health metrics to determine condition
      const recentMetrics = await this.healthMetricRepository.find({
        where: { patient_id: patientId },
        order: { created_at: 'DESC' },
        take: 10,
      });

      if (recentMetrics.length > 0) {
        // Analyze recent metrics to determine primary condition
        const metricTypes = recentMetrics.map(m => m.metric_type);
        const uniqueTypes = [...new Set(metricTypes)];
        
        // Check for specific conditions based on metric types
        if (uniqueTypes.includes('blood_pressure')) {
          const bpMetric = recentMetrics.find(m => m.metric_type === 'blood_pressure');
          if (bpMetric && bpMetric.systolic_pressure && bpMetric.systolic_pressure > 140) {
            return 'Hypertension';
          }
        }
        
        if (uniqueTypes.includes('blood_sugar')) {
          const sugarMetric = recentMetrics.find(m => m.metric_type === 'blood_sugar');
          if (sugarMetric && sugarMetric.blood_sugar_fasting && sugarMetric.blood_sugar_fasting > 126) {
            return 'Diabetes';
          }
        }
        
        if (uniqueTypes.includes('cholesterol')) {
          const cholesterolMetric = recentMetrics.find(m => m.metric_type === 'cholesterol');
          if (cholesterolMetric && cholesterolMetric.total_cholesterol && cholesterolMetric.total_cholesterol > 200) {
            return 'High Cholesterol';
          }
        }
        
        if (uniqueTypes.includes('anthropometric')) {
          const bmiMetric = recentMetrics.find(m => m.metric_type === 'anthropometric');
          if (bmiMetric && bmiMetric.bmi && bmiMetric.bmi > 30) {
            return 'Obesity';
          }
        }

        // Return based on most common metric type
        const metricTypeCounts: { [key: string]: number } = {};
        metricTypes.forEach(type => {
          metricTypeCounts[type] = (metricTypeCounts[type] || 0) + 1;
        });

        const mostCommonType = Object.keys(metricTypeCounts).reduce((a, b) => 
          metricTypeCounts[a] > metricTypeCounts[b] ? a : b
        );

        switch (mostCommonType) {
          case 'blood_pressure':
            return 'Blood Pressure Monitoring';
          case 'blood_sugar':
            return 'Blood Sugar Monitoring';
          case 'cholesterol':
            return 'Cholesterol Management';
          case 'vital_signs':
            return 'Vital Signs Monitoring';
          case 'liver_function':
            return 'Liver Health';
          case 'kidney_function':
            return 'Kidney Health';
          case 'anthropometric':
            return 'Weight Management';
          default:
            return 'General Health Monitoring';
        }
      }

      return 'General Health';
    } catch (error) {
      return 'General Health';
    }
  }

  private async getLastVisit(patientId: number): Promise<string> {
    try {
      const lastAppointment = await this.appointmentRepository.findOne({
        where: { patient_id: patientId },
        order: { appointment_date: 'DESC' },
      });

      if (lastAppointment) {
        return new Date(lastAppointment.appointment_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      return 'No visits';
    } catch (error) {
      return 'No visits';
    }
  }

  private async calculateRiskLevel(patientId: number): Promise<'low' | 'moderate' | 'high'> {
    try {
      // Get recent AI predictions
      const predictions = await this.aiPredictionRepository.find({
        where: { patient_id: patientId },
        order: { created_at: 'DESC' },
        take: 5,
      });

      if (predictions.length === 0) {
        return 'low';
      }

      // Calculate average risk level
      const riskScores = predictions.map(p => {
        switch (p.risk_level) {
          case 'high': return 3;
          case 'moderate': return 2;
          case 'low': return 1;
          default: return 1;
        }
      });

      const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

      if (averageRisk >= 2.5) return 'high';
      if (averageRisk >= 1.5) return 'moderate';
      return 'low';
    } catch (error) {
      return 'low';
    }
  }

  private async hasAIAlert(patientId: number): Promise<boolean> {
    try {
      const alertCount = await this.aiPredictionRepository.count({
        where: { patient_id: patientId, is_alert: true },
      });
      return alertCount > 0;
    } catch (error) {
      return false;
    }
  }

  private async getRecentMetrics(patientId: number): Promise<any[]> {
    try {
      const metrics = await this.healthMetricRepository.find({
        where: { patient_id: patientId },
        order: { created_at: 'DESC' },
        take: 3,
      });
      return metrics;
    } catch (error) {
      return [];
    }
  }

  private async getUpcomingAppointments(patientId: number): Promise<any[]> {
    try {
      const appointments = await this.appointmentRepository.find({
        where: { patient_id: patientId },
        order: { appointment_date: 'ASC' },
        take: 3,
      });
      return appointments;
    } catch (error) {
      return [];
    }
  }
} 