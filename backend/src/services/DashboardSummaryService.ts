import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { HealthMetric } from '../entities/HealthMetric';
import { AppError } from '../utils/errors';

export interface DashboardSummary {
  totalPatients: {
    count: number;
    changeLastMonth: number;
  };
  aiPredictions: {
    total: number;
    highRiskCases: number;
  };
  highRiskAlerts: {
    total: number;
    newSinceYesterday: number;
  };
  healthMetrics: {
    total: number;
    changeThisWeek: number;
  };
}

export class DashboardSummaryService {
  private patientRepository: Repository<Patient>;
  private aiPredictionRepository: Repository<AIPrediction>;
  private healthMetricRepository: Repository<HealthMetric>;

  constructor() {
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Total Patients
      const totalPatientsCount = await this.patientRepository.count();
      
      // Calculate change from last month (simplified - using created_at)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const patientsLastMonth = await this.patientRepository.count({
        where: {
          created_at: MoreThanOrEqual(oneMonthAgo),
        },
      });
      const patientsBeforeLastMonth = await this.patientRepository.count({
        where: {
          created_at: LessThan(oneMonthAgo),
        },
      });
      const changeLastMonth = patientsLastMonth; // Simplified: just new patients this month

      // AI Predictions
      const totalAIPredictions = await this.aiPredictionRepository.count();
      const highRiskAIPredictions = await this.aiPredictionRepository.count({
        where: {
          risk_level: RiskLevel.HIGH,
        },
      });

      // High Risk Alerts (AI predictions with alerts)
      const totalHighRiskAlerts = await this.aiPredictionRepository.count({
        where: {
          is_alert: true,
        },
      });
      
      // New alerts since yesterday
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const newHighRiskAlertsSinceYesterday = await this.aiPredictionRepository.count({
        where: {
          is_alert: true,
          created_at: MoreThanOrEqual(twentyFourHoursAgo),
        },
      });

      // Health Metrics
      const totalHealthMetrics = await this.healthMetricRepository.count();
      
      // Calculate change this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      
      const healthMetricsThisWeek = await this.healthMetricRepository.count({
        where: {
          created_at: Between(startOfWeek, endOfWeek),
        },
      });
      const healthMetricsBeforeThisWeek = await this.healthMetricRepository.count({
        where: {
          created_at: LessThan(startOfWeek),
        },
      });
      const changeThisWeek = healthMetricsThisWeek; // Simplified: just new metrics this week

      return {
        totalPatients: {
          count: totalPatientsCount,
          changeLastMonth: changeLastMonth,
        },
        aiPredictions: {
          total: totalAIPredictions,
          highRiskCases: highRiskAIPredictions,
        },
        highRiskAlerts: {
          total: totalHighRiskAlerts,
          newSinceYesterday: newHighRiskAlertsSinceYesterday,
        },
        healthMetrics: {
          total: totalHealthMetrics,
          changeThisWeek: changeThisWeek,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new AppError('Failed to fetch dashboard summary', 500);
    }
  }
} 