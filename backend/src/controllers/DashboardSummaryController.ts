import { Request, Response, NextFunction } from 'express';
import { DashboardSummaryService } from '../services/DashboardSummaryService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../entities/User';

export class DashboardSummaryController {
  private dashboardSummaryService: DashboardSummaryService;

  constructor() {
    this.dashboardSummaryService = new DashboardSummaryService();
  }

  // GET /api/dashboard/summary
  getDashboardSummary = async (
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
        throw new ValidationError('Access denied. Only doctors can view dashboard summary.');
      }

      const summary = await this.dashboardSummaryService.getDashboardSummary();

      ResponseHandler.success(
        res,
        summary,
        'Dashboard summary retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 