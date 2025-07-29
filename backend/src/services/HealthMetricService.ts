import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { HealthMetric } from '../entities/HealthMetric';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import { Gender } from '../entities/Patient';
import { NotFoundError } from '../utils/errors';

export class HealthMetricService {
  private healthMetricRepository: Repository<HealthMetric>;
  private patientRepository: Repository<Patient>;

  constructor() {
    this.healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    this.patientRepository = AppDataSource.getRepository(Patient);
  }

  // Get all health metrics for a patient
  async getPatientHealthMetrics(patientId: number): Promise<HealthMetric[]> {
    // First try to find patient by ID
    let patient = await this.patientRepository.findOne({ where: { id: patientId } });
    
    // If not found, try to find by user_id
    if (!patient) {
      patient = await this.patientRepository.findOne({ where: { user_id: patientId } });
    }
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return await this.healthMetricRepository.find({
      where: { patient_id: patient.id },
      relations: ['patient', 'recorded_by_user'],
      order: { created_at: 'DESC' },
    });
  }

  // Get health metric by ID
  async getHealthMetricById(id: number): Promise<HealthMetric> {
    const metric = await this.healthMetricRepository.findOne({
      where: { id },
      relations: ['patient', 'recorded_by_user'],
    });

    if (!metric) {
      throw new NotFoundError('Health metric not found');
    }

    return metric;
  }

  // Create new health metric
  async createHealthMetric(metricData: Partial<HealthMetric>): Promise<HealthMetric> {
    // First try to find patient by ID
    let patient = await this.patientRepository.findOne({ where: { id: metricData.patient_id } });
    
    // If not found, try to find by user_id
    if (!patient && metricData.patient_id) {
      patient = await this.patientRepository.findOne({ where: { user_id: metricData.patient_id } });
      
      // If still not found, create a patient record for this user
      if (!patient) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: metricData.patient_id } });
        
        if (!user) {
          throw new NotFoundError('User not found');
        }
        
        // Create a new patient record for this user
        const newPatient = this.patientRepository.create({
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: new Date(), // Default date, can be updated later
          gender: Gender.MALE, // Default gender, can be updated later
          patient_id: `P${user.id.toString().padStart(6, '0')}`, // Generate patient ID
        });
        
        patient = await this.patientRepository.save(newPatient);
      }
    }
    
    if (!patient) {
      throw new NotFoundError('Patient not found and could not be created');
    }

    // Update the metric data with the correct patient_id
    metricData.patient_id = patient.id;
    
    const metric = this.healthMetricRepository.create(metricData);
    return await this.healthMetricRepository.save(metric);
  }

  // Update health metric
  async updateHealthMetric(id: number, updateData: Partial<HealthMetric>): Promise<HealthMetric> {
    const metric = await this.healthMetricRepository.findOne({ where: { id } });
    if (!metric) {
      throw new NotFoundError('Health metric not found');
    }

    Object.assign(metric, updateData);
    return await this.healthMetricRepository.save(metric);
  }

  // Delete health metric
  async deleteHealthMetric(id: number): Promise<void> {
    const metric = await this.healthMetricRepository.findOne({ where: { id } });
    if (!metric) {
      throw new NotFoundError('Health metric not found');
    }

    await this.healthMetricRepository.remove(metric);
  }

  // Get latest health metrics for a patient
  async getLatestHealthMetrics(patientId: number): Promise<HealthMetric[]> {
    // First try to find patient by ID
    let patient = await this.patientRepository.findOne({ where: { id: patientId } });
    
    // If not found, try to find by user_id
    if (!patient) {
      patient = await this.patientRepository.findOne({ where: { user_id: patientId } });
    }
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Get the latest metric for each metric type
    const metricTypes = [
      'blood_pressure',
      'blood_sugar',
      'cholesterol',
      'bmi',
      'temperature',
      'heart_rate',
      'oxygen_saturation',
      'liver_enzymes',
      'kidney_function',
    ];

    const latestMetrics: HealthMetric[] = [];

    for (const metricType of metricTypes) {
      const latestMetric = await this.healthMetricRepository.findOne({
        where: { patient_id: patient.id, metric_type: metricType },
        order: { created_at: 'DESC' },
        relations: ['patient', 'recorded_by_user'],
      });

      if (latestMetric) {
        latestMetrics.push(latestMetric);
      }
    }

    return latestMetrics;
  }

  // Get health metric trends for a patient
  async getHealthMetricTrends(patientId: number): Promise<any> {
    // First try to find patient by ID
    let patient = await this.patientRepository.findOne({ where: { id: patientId } });
    
    // If not found, try to find by user_id
    if (!patient) {
      patient = await this.patientRepository.findOne({ where: { user_id: patientId } });
    }
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Get metrics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const metrics = await this.healthMetricRepository.find({
      where: { patient_id: patient.id },
      order: { created_at: 'ASC' },
    });

    // Group metrics by type and create trend data
    const trends: any = {};

    metrics.forEach(metric => {
      if (!trends[metric.metric_type]) {
        trends[metric.metric_type] = [];
      }

      trends[metric.metric_type].push({
        date: metric.created_at,
        value: this.getMetricValue(metric),
        unit: this.getMetricUnit(metric.metric_type),
      });
    });

    return trends;
  }

  // Helper method to get metric value based on type
  private getMetricValue(metric: HealthMetric): number | null {
    switch (metric.metric_type) {
      case 'blood_pressure':
        return metric.systolic_pressure;
      case 'blood_sugar':
        return metric.blood_sugar_fasting || metric.blood_sugar_random;
      case 'cholesterol':
        return metric.total_cholesterol;
      case 'bmi':
        return metric.bmi;
      case 'temperature':
        return metric.temperature_celsius;
      case 'heart_rate':
        return metric.heart_rate;
      case 'oxygen_saturation':
        return metric.oxygen_saturation;
      case 'liver_enzymes':
        return metric.alt_enzyme || metric.ast_enzyme;
      case 'kidney_function':
        return metric.creatinine;
      default:
        return null;
    }
  }

  // Helper method to get metric unit
  private getMetricUnit(metricType: string): string {
    switch (metricType) {
      case 'blood_pressure':
        return 'mmHg';
      case 'blood_sugar':
        return 'mg/dL';
      case 'cholesterol':
        return 'mg/dL';
      case 'bmi':
        return 'kg/m²';
      case 'temperature':
        return '°C';
      case 'heart_rate':
        return 'bpm';
      case 'oxygen_saturation':
        return '%';
      case 'liver_enzymes':
        return 'U/L';
      case 'kidney_function':
        return 'mg/dL';
      default:
        return '';
    }
  }
} 