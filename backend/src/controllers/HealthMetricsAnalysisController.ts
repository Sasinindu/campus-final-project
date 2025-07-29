import { Request, Response, NextFunction } from 'express';
import { HealthMetricsAnalysisService } from '../services/HealthMetricsAnalysisService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../entities/User';

export class HealthMetricsAnalysisController {
  private healthMetricsAnalysisService: HealthMetricsAnalysisService;

  constructor() {
    this.healthMetricsAnalysisService = new HealthMetricsAnalysisService();
  }

  // GET /api/health-metrics-analysis
  getHealthMetricsAnalysis = async (
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
        throw new ValidationError('Access denied. Only doctors can view health metrics analysis.');
      }

      const analysis = await this.healthMetricsAnalysisService.getHealthMetricsAnalysis();

      ResponseHandler.success(
        res,
        analysis,
        'Health metrics analysis retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 