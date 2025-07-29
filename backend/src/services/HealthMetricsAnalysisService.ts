import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { HealthMetric } from '../entities/HealthMetric';
import { Patient } from '../entities/Patient';
import { AppError } from '../utils/errors';

export interface MetricAnalysis {
  metric: string;
  inControl: number;
  borderline: number;
  outOfRange: number;
  total: number;
}

export interface HealthMetricsAnalysis {
  metrics: MetricAnalysis[];
  summary: {
    totalPatients: number;
    averageInControl: number;
    averageBorderline: number;
    averageOutOfRange: number;
  };
}

export class HealthMetricsAnalysisService {
  private healthMetricRepository: Repository<HealthMetric>;
  private patientRepository: Repository<Patient>;

  constructor() {
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    this.patientRepository = AppDataSource.getRepository(Patient);
  }

  async getHealthMetricsAnalysis(): Promise<HealthMetricsAnalysis> {
    try {
      // Get all health metrics with patient data
      const healthMetrics = await this.healthMetricRepository.find({
        relations: ['patient'],
        order: { created_at: 'DESC' }
      });

      if (healthMetrics.length === 0) {
        return this.getEmptyAnalysis();
      }

      // Define metric ranges for analysis
      const metricRanges = {
        'HbA1c': { inControl: [0, 5.7], borderline: [5.7, 6.4], outOfRange: [6.4, 15] },
        'Blood Pressure': { inControl: [0, 120], borderline: [120, 140], outOfRange: [140, 200] },
        'LDL Cholesterol': { inControl: [0, 100], borderline: [100, 130], outOfRange: [130, 300] },
        'HDL Cholesterol': { inControl: [40, 200], borderline: [35, 40], outOfRange: [0, 35] },
        'Triglycerides': { inControl: [0, 150], borderline: [150, 200], outOfRange: [200, 500] },
        'BMI': { inControl: [18.5, 25], borderline: [25, 30], outOfRange: [0, 18.5] }
      };

      // Group metrics by type and analyze
      const metricsAnalysis: MetricAnalysis[] = [];
      const metricTypes = Object.keys(metricRanges);

      for (const metricType of metricTypes) {
        const metricsOfType = healthMetrics.filter(metric => 
          metric.metric_type.toLowerCase().includes(metricType.toLowerCase())
        );

        if (metricsOfType.length === 0) {
          metricsAnalysis.push({
            metric: metricType,
            inControl: 0,
            borderline: 0,
            outOfRange: 0,
            total: 0
          });
          continue;
        }

        const ranges = metricRanges[metricType as keyof typeof metricRanges];
        let inControl = 0;
        let borderline = 0;
        let outOfRange = 0;

        for (const metric of metricsOfType) {
          let value: number;
          
          // Get the appropriate field value based on metric type
          switch (metricType) {
            case 'HbA1c':
              value = metric.hba1c || 0;
              break;
            case 'Blood Pressure':
              value = metric.systolic_pressure || 0;
              break;
            case 'LDL Cholesterol':
              value = metric.ldl_cholesterol || 0;
              break;
            case 'HDL Cholesterol':
              value = metric.hdl_cholesterol || 0;
              break;
            case 'Triglycerides':
              value = metric.triglycerides || 0;
              break;
            case 'BMI':
              value = metric.bmi || 0;
              break;
            default:
              value = 0;
          }
          
          if (value === 0) continue; // Skip if no value
          
          if (metricType === 'HDL Cholesterol') {
            // HDL is inverse - higher is better
            if (value >= ranges.inControl[0] && value <= ranges.inControl[1]) {
              inControl++;
            } else if (value >= ranges.borderline[0] && value <= ranges.borderline[1]) {
              borderline++;
            } else {
              outOfRange++;
            }
          } else {
            // Normal ranges
            if (value >= ranges.inControl[0] && value <= ranges.inControl[1]) {
              inControl++;
            } else if (value >= ranges.borderline[0] && value <= ranges.borderline[1]) {
              borderline++;
            } else {
              outOfRange++;
            }
          }
        }

        const total = inControl + borderline + outOfRange;
        
        metricsAnalysis.push({
          metric: metricType,
          inControl: total > 0 ? Math.round((inControl / total) * 100) : 0,
          borderline: total > 0 ? Math.round((borderline / total) * 100) : 0,
          outOfRange: total > 0 ? Math.round((outOfRange / total) * 100) : 0,
          total
        });
      }

      // Calculate summary statistics
      const totalPatients = await this.patientRepository.count();
      const totalMetrics = metricsAnalysis.length;
      const averageInControl = Math.round(
        metricsAnalysis.reduce((sum, m) => sum + m.inControl, 0) / totalMetrics
      );
      const averageBorderline = Math.round(
        metricsAnalysis.reduce((sum, m) => sum + m.borderline, 0) / totalMetrics
      );
      const averageOutOfRange = Math.round(
        metricsAnalysis.reduce((sum, m) => sum + m.outOfRange, 0) / totalMetrics
      );

      return {
        metrics: metricsAnalysis,
        summary: {
          totalPatients,
          averageInControl,
          averageBorderline,
          averageOutOfRange
        }
      };
    } catch (error) {
      throw new AppError('Failed to analyze health metrics', 500);
    }
  }

  private getEmptyAnalysis(): HealthMetricsAnalysis {
    const emptyMetrics = [
      'HbA1c', 'Blood Pressure', 'LDL Cholesterol', 
      'HDL Cholesterol', 'Triglycerides', 'BMI'
    ].map(metric => ({
      metric,
      inControl: 0,
      borderline: 0,
      outOfRange: 0,
      total: 0
    }));

    return {
      metrics: emptyMetrics,
      summary: {
        totalPatients: 0,
        averageInControl: 0,
        averageBorderline: 0,
        averageOutOfRange: 0
      }
    };
  }
} 