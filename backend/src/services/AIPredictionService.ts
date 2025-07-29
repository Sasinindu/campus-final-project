import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import { AppError } from '../utils/errors';

export interface AIPredictionWithPatient {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_identifier: string;
  prediction_type: string;
  risk_level: RiskLevel;
  risk_percentage: number;
  confidence_score: number;
  factors: string[];
  explanation: string;
  recommendations: string[];
  is_alert: boolean;
  is_reviewed: boolean;
  reviewed_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AIPredictionFilters {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: string;
  predictionType?: string;
}

export class AIPredictionService {
  private aiPredictionRepository: Repository<AIPrediction>;
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;

  constructor() {
    this.aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getAIPredictions(filters: AIPredictionFilters = {}): Promise<AIPredictionWithPatient[]> {
    try {
      const { page = 1, limit = 10, search, riskLevel, predictionType } = filters;
      const skip = (page - 1) * limit;

      // Build query for AI predictions with patient data
      const queryBuilder = this.aiPredictionRepository
        .createQueryBuilder('prediction')
        .leftJoinAndSelect('prediction.patient', 'patient')
        .leftJoinAndSelect('patient.user', 'user')
        .leftJoinAndSelect('prediction.reviewed_by_user', 'reviewer')
        .orderBy('prediction.updated_at', 'DESC'); // Show last updated first

      // Apply filters
      if (search) {
        queryBuilder.andWhere(
          '(patient.first_name LIKE :search OR patient.last_name LIKE :search OR prediction.prediction_type LIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (riskLevel && riskLevel !== 'all') {
        queryBuilder.andWhere('prediction.risk_level = :riskLevel', { riskLevel });
      }

      if (predictionType && predictionType !== 'all') {
        queryBuilder.andWhere('prediction.prediction_type = :predictionType', { predictionType });
      }

      const predictions = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      // Transform to include patient details
      const enrichedPredictions: AIPredictionWithPatient[] = predictions.map(prediction => ({
        id: prediction.id,
        patient_id: prediction.patient_id,
        patient_name: `${prediction.patient.last_name}, ${prediction.patient.first_name}`,
        patient_identifier: prediction.patient.patient_id,
        prediction_type: prediction.prediction_type,
        risk_level: prediction.risk_level,
        risk_percentage: prediction.risk_percentage,
        confidence_score: prediction.confidence_score,
        factors: prediction.factors,
        explanation: prediction.explanation,
        recommendations: prediction.recommendations,
        is_alert: prediction.is_alert,
        is_reviewed: prediction.is_reviewed,
        reviewed_by: prediction.reviewed_by_user ? 
          `${prediction.reviewed_by_user.first_name} ${prediction.reviewed_by_user.last_name}` : 
          undefined,
        created_at: prediction.created_at,
        updated_at: prediction.updated_at,
      }));

      return enrichedPredictions;
    } catch (error) {
      throw new AppError('Failed to get AI predictions', 500);
    }
  }

  async getAIPredictionById(predictionId: number): Promise<AIPredictionWithPatient> {
    try {
      const prediction = await this.aiPredictionRepository.findOne({
        where: { id: predictionId },
        relations: ['patient', 'patient.user', 'reviewed_by_user'],
      });

      if (!prediction) {
        throw new AppError('AI prediction not found', 404);
      }

      return {
        id: prediction.id,
        patient_id: prediction.patient_id,
        patient_name: `${prediction.patient.last_name}, ${prediction.patient.first_name}`,
        patient_identifier: prediction.patient.patient_id,
        prediction_type: prediction.prediction_type,
        risk_level: prediction.risk_level,
        risk_percentage: prediction.risk_percentage,
        confidence_score: prediction.confidence_score,
        factors: prediction.factors,
        explanation: prediction.explanation,
        recommendations: prediction.recommendations,
        is_alert: prediction.is_alert,
        is_reviewed: prediction.is_reviewed,
        reviewed_by: prediction.reviewed_by_user ? 
          `${prediction.reviewed_by_user.first_name} ${prediction.reviewed_by_user.last_name}` : 
          undefined,
        created_at: prediction.created_at,
        updated_at: prediction.updated_at,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get AI prediction', 500);
    }
  }

  async reviewAIPrediction(
    predictionId: number, 
    doctorId: number, 
    reviewData: { is_reviewed: boolean; review_notes?: string }
  ): Promise<AIPredictionWithPatient> {
    try {
      const prediction = await this.aiPredictionRepository.findOne({
        where: { id: predictionId },
        relations: ['patient', 'patient.user', 'reviewed_by_user'],
      });

      if (!prediction) {
        throw new AppError('AI prediction not found', 404);
      }

      // Update prediction with review data
      prediction.is_reviewed = reviewData.is_reviewed;
      prediction.reviewed_by = doctorId;
      prediction.updated_at = new Date();

      const updatedPrediction = await this.aiPredictionRepository.save(prediction);

      return {
        id: updatedPrediction.id,
        patient_id: updatedPrediction.patient_id,
        patient_name: `${updatedPrediction.patient.last_name}, ${updatedPrediction.patient.first_name}`,
        patient_identifier: updatedPrediction.patient.patient_id,
        prediction_type: updatedPrediction.prediction_type,
        risk_level: updatedPrediction.risk_level,
        risk_percentage: updatedPrediction.risk_percentage,
        confidence_score: updatedPrediction.confidence_score,
        factors: updatedPrediction.factors,
        explanation: updatedPrediction.explanation,
        recommendations: updatedPrediction.recommendations,
        is_alert: updatedPrediction.is_alert,
        is_reviewed: updatedPrediction.is_reviewed,
        reviewed_by: updatedPrediction.reviewed_by_user ? 
          `${updatedPrediction.reviewed_by_user.first_name} ${updatedPrediction.reviewed_by_user.last_name}` : 
          undefined,
        created_at: updatedPrediction.created_at,
        updated_at: updatedPrediction.updated_at,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to review AI prediction', 500);
    }
  }
} 