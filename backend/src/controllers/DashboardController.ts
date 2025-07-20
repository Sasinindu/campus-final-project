import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError, AuthorizationError } from '../utils/errors';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // GET /api/dashboard/summary
  getDashboardSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await this.dashboardService.getDashboardSummary();

      ResponseHandler.success(
        res,
        summary,
        'Dashboard summary retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/doctor
  getDoctorDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = (req as any).user?.userId;

      if (!doctorId) {
        throw new AuthorizationError('User not authenticated');
      }

      const dashboard =
        await this.dashboardService.getDoctorDashboard(doctorId);

      ResponseHandler.success(
        res,
        dashboard,
        'Doctor dashboard retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/patient/:patientId
  getPatientDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientIdParam = req.params.patientId;
      if (!patientIdParam) {
        throw new ValidationError('Patient ID is required');
      }
      const patientId = parseInt(patientIdParam);

      if (isNaN(patientId)) {
        throw new ValidationError('Invalid patient ID');
      }

      const dashboard =
        await this.dashboardService.getPatientDashboard(patientId);

      ResponseHandler.success(
        res,
        dashboard,
        'Patient dashboard retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/official
  getOfficialDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'official') {
        throw new AuthorizationError('Access denied. Official role required.');
      }

      const dashboard = await this.dashboardService.getOfficialDashboard();

      ResponseHandler.success(
        res,
        dashboard,
        'Official dashboard retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
}
