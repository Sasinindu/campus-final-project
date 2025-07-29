import { Request, Response } from 'express';
import { AIHealthPredictionService } from '../services/AIHealthPredictionService';
import { ResponseHandler } from '../utils/responseHandler';
import { CustomException } from '../exception/CustomException';
import { UserRole } from '../entities/User';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userRole: UserRole;
  };
}

export class AIHealthPredictionController {
  constructor(private aiHealthPredictionService: AIHealthPredictionService) {}

  async generatePrediction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const user = req.user;

      // Check if user is authorized (doctor or officer)
      if (!user || (user.userRole !== UserRole.DOCTOR && user.userRole !== UserRole.OFFICIAL)) {
        throw new CustomException('Access denied. Only doctors and officers can generate AI predictions.', 0, 403);
      }

      if (!patientId || isNaN(Number(patientId))) {
        throw new CustomException('Valid patient ID is required', 0, 400);
      }

      const prediction = await this.aiHealthPredictionService.generateHealthPrediction(Number(patientId));

      ResponseHandler.success(res, {
        message: 'AI health prediction generated successfully',
        data: prediction
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      ResponseHandler.error(res, errorMessage);
    }
  }

  async getPatientPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const user = req.user;

      // Check if user is authorized (doctor or officer)
      if (!user || (user.userRole !== UserRole.DOCTOR && user.userRole !== UserRole.OFFICIAL)) {
        throw new CustomException('Access denied. Only doctors and officers can view AI predictions.', 0, 403);
      }

      if (!patientId || isNaN(Number(patientId))) {
        throw new CustomException('Valid patient ID is required', 0, 400);
      }

      const predictions = await this.aiHealthPredictionService.getPatientPredictions(Number(patientId));

      ResponseHandler.success(res, {
        message: 'Patient AI predictions retrieved successfully',
        data: predictions
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      ResponseHandler.error(res, errorMessage);
    }
  }

  async updatePrediction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { predictionId } = req.params;
      const updates = req.body;
      const user = req.user;

      // Check if user is authorized (doctor or officer)
      if (!user || (user.userRole !== UserRole.DOCTOR && user.userRole !== UserRole.OFFICIAL)) {
        throw new CustomException('Access denied. Only doctors and officers can update AI predictions.', 0, 403);
      }

      if (!predictionId || isNaN(Number(predictionId))) {
        throw new CustomException('Valid prediction ID is required', 0, 400);
      }

      const prediction = await this.aiHealthPredictionService.updatePrediction(Number(predictionId), updates);

      ResponseHandler.success(res, {
        message: 'AI prediction updated successfully',
        data: prediction
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      ResponseHandler.error(res, errorMessage);
    }
  }
} 