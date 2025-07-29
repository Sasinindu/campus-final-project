import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import { HealthMetric } from '../entities/HealthMetric';
import { AIPrediction } from '../entities/AIPrediction';
import { Alert } from '../entities/Alert';
import { Medication } from '../entities/Medication';
import {
  DashboardSummary,
  DoctorDashboardData,
  PatientDashboardData,
  OfficialDashboardData,
} from '../types';
import { AppError } from '../utils/errors';

export class DashboardService {
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;
  private healthMetricRepository: Repository<HealthMetric>;
  private aiPredictionRepository: Repository<AIPrediction>;
  private alertRepository: Repository<Alert>;
  private medicationRepository: Repository<Medication>;

  constructor() {
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    this.aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    this.alertRepository = AppDataSource.getRepository(Alert);
    this.medicationRepository = AppDataSource.getRepository(Medication);
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const [
        totalPatients,
        totalDoctors,
        totalMetrics,
        totalPredictions,
        recentAlerts,
        criticalPatients,
      ] = await Promise.all([
        this.patientRepository.count({ where: { is_active: true } }),
        this.userRepository.count({
          where: { userRole: 'doctor', isActive: true },
        }),
        this.healthMetricRepository.count(),
        this.aiPredictionRepository.count(),
        this.alertRepository.count({ where: { is_read: false } }),
        this.patientRepository.count({ where: { is_active: true } }), // Placeholder for critical patients
      ]);

      return {
        total_patients: totalPatients,
        total_doctors: totalDoctors,
        total_metrics: totalMetrics,
        total_predictions: totalPredictions,
        recent_alerts: recentAlerts,
        critical_patients: criticalPatients,
      };
    } catch {
      throw new AppError('Failed to get dashboard summary', 500);
    }
  }

  async getDoctorDashboard(doctorId: number): Promise<DoctorDashboardData> {
    try {
      const summary = await this.getDashboardSummary();

      const [
        myPatients,
        recentPredictions,
        criticalMetrics,
      ] = await Promise.all([
        this.patientRepository.count({
          where: { primary_doctor_id: doctorId, is_active: true },
        }),
        this.aiPredictionRepository.count({ where: { is_alert: true } }),
        Promise.resolve([]), // Placeholder for critical metrics
      ]);

      return {
        ...summary,
        my_patients: myPatients,
        pending_appointments: 0, // Removed appointments
        recent_predictions: recentPredictions,
        critical_metrics: criticalMetrics,
      };
    } catch {
      throw new AppError('Failed to get doctor dashboard', 500);
    }
  }

  async getPatientDashboard(patientId: number): Promise<PatientDashboardData> {
    try {
      const [
        recentMetrics,
        recentPredictions,
        activeMedications,
        alerts,
      ] = await Promise.all([
        this.healthMetricRepository.find({
          where: { patient_id: patientId },
          order: { created_at: 'DESC' },
          take: 10,
        }),
        this.aiPredictionRepository.find({
          where: { patient_id: patientId },
          order: { created_at: 'DESC' },
          take: 5,
        }),
        this.medicationRepository.find({
          where: { patient_id: patientId, is_active: true },
          relations: ['prescribed_by_user'],
          order: { created_at: 'DESC' },
          take: 5,
        }),
        this.alertRepository.find({
          where: { patient_id: patientId, is_read: false },
          order: { created_at: 'DESC' },
          take: 10,
        }),
      ]);

      return {
        recent_metrics: recentMetrics,
        recent_predictions: recentPredictions,
        upcoming_appointments: [], // Removed appointments
        active_medications: activeMedications,
        alerts: alerts,
      };
    } catch {
      throw new AppError('Failed to get patient dashboard', 500);
    }
  }

  async getOfficialDashboard(): Promise<OfficialDashboardData> {
    try {
      const summary = await this.getDashboardSummary();

      const [regionalStats, diseasePrevalence, populationHealth] =
        await Promise.all([
          this.patientRepository
            .createQueryBuilder('patient')
            .select('patient.region', 'region')
            .addSelect('COUNT(*)', 'count')
            .where('patient.region IS NOT NULL')
            .groupBy('patient.region')
            .getRawMany(),
          Promise.resolve([]), // Placeholder for disease prevalence
          Promise.resolve([]), // Placeholder for population health
        ]);

      return {
        ...summary,
        regional_stats: regionalStats.map((item) => ({
          region: item.region,
          count: parseInt(item.count),
        })),
        disease_prevalence: diseasePrevalence,
        population_health: populationHealth,
      };
    } catch {
      throw new AppError('Failed to get official dashboard', 500);
    }
  }
}
