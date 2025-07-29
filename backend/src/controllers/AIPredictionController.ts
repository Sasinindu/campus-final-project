import { Request, Response, NextFunction } from 'express';
import { AIPredictionService } from '../services/AIPredictionService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../entities/User';

export class AIPredictionController {
  private aiPredictionService: AIPredictionService;

  constructor() {
    this.aiPredictionService = new AIPredictionService();
  }

  // GET /api/ai-predictions
  getAIPredictions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is a doctor
      if (user.userRole !== UserRole.DOCTOR) {
        throw new ValidationError('Access denied. Only doctors can view AI predictions.');
      }

      const { page = 1, limit = 10, search, riskLevel, predictionType } = req.query;
      
      const predictions = await this.aiPredictionService.getAIPredictions({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        riskLevel: riskLevel as string,
        predictionType: predictionType as string,
      });

      ResponseHandler.success(
        res,
        predictions,
        'AI predictions retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/ai-predictions/:predictionId
  getAIPredictionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is a doctor
      if (user.userRole !== UserRole.DOCTOR) {
        throw new ValidationError('Access denied. Only doctors can view AI predictions.');
      }

      const { predictionId } = req.params;
      const predictionIdNum = parseInt(predictionId);

      if (isNaN(predictionIdNum)) {
        throw new ValidationError('Invalid prediction ID');
      }

      const prediction = await this.aiPredictionService.getAIPredictionById(predictionIdNum);

      ResponseHandler.success(
        res,
        prediction,
        'AI prediction details retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/ai-predictions/:predictionId/review
  reviewAIPrediction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is a doctor
      if (user.userRole !== UserRole.DOCTOR) {
        throw new ValidationError('Access denied. Only doctors can review AI predictions.');
      }

      const { predictionId } = req.params;
      const predictionIdNum = parseInt(predictionId);

      if (isNaN(predictionIdNum)) {
        throw new ValidationError('Invalid prediction ID');
      }

      const { is_reviewed } = req.body;

      const prediction = await this.aiPredictionService.reviewAIPrediction(
        predictionIdNum,
        user.id,
        { is_reviewed }
      );

      ResponseHandler.success(
        res,
        prediction,
        'AI prediction reviewed successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 