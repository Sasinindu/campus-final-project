import { Request, Response, NextFunction } from 'express';
import { OfficerService } from '../services/OfficerService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../entities/User';
import { CreatePatientDto, CreateHealthMetricDto } from '../types';

export class OfficerController {
  private officerService: OfficerService;

  constructor() {
    this.officerService = new OfficerService();
  }

  // GET /api/officer/dashboard
  getOfficerDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is an official
      if (user.userRole !== UserRole.OFFICIAL) {
        throw new ValidationError('Access denied. Only officials can view officer dashboard.');
      }

      const dashboard = await this.officerService.getOfficerDashboard();

      ResponseHandler.success(
        res,
        dashboard,
        'Officer dashboard retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/officer/patients
  addPatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is an official
      if (user.userRole !== UserRole.OFFICIAL) {
        throw new ValidationError('Access denied. Only officials can add patients.');
      }

      const patientData: CreatePatientDto = req.body;
      const patient = await this.officerService.addPatient(patientData, user.id);

      ResponseHandler.success(
        res,
        patient,
        'Patient added successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/officer/health-reports
  addHealthReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is an official
      if (user.userRole !== UserRole.OFFICIAL) {
        throw new ValidationError('Access denied. Only officials can add health reports.');
      }

      const healthData: CreateHealthMetricDto = req.body;
      const healthReport = await this.officerService.addHealthReport(healthData, user.id);

      ResponseHandler.success(
        res,
        healthReport,
        'Health report added successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/officer/patients
  getAllPatients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is an official
      if (user.userRole !== UserRole.OFFICIAL) {
        throw new ValidationError('Access denied. Only officials can view patients.');
      }

      const patients = await this.officerService.getAllPatients();

      ResponseHandler.success(
        res,
        patients,
        'Patients retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/officer/patients/:patientId/health-reports
  getPatientHealthReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      // Check if user is an official
      if (user.userRole !== UserRole.OFFICIAL) {
        throw new ValidationError('Access denied. Only officials can view health reports.');
      }

      const { patientId } = req.params;
      const patientIdNum = parseInt(patientId);

      if (isNaN(patientIdNum)) {
        throw new ValidationError('Invalid patient ID');
      }

      const healthReports = await this.officerService.getPatientHealthReports(patientIdNum);

      ResponseHandler.success(
        res,
        healthReports,
        'Patient health reports retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 