import { Request, Response, NextFunction } from 'express';
import { DoctorPatientService } from '../services/DoctorPatientService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../entities/User';

export class DoctorPatientController {
  private doctorPatientService: DoctorPatientService;

  constructor() {
    this.doctorPatientService = new DoctorPatientService();
  }

  // GET /api/doctor/patients
  getRecentPatients = async (
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
        throw new ValidationError('Access denied. Only doctors can view patient data.');
      }

      const { page = 1, limit = 10, search, riskLevel, hasAlerts } = req.query;
      
      const patients = await this.doctorPatientService.getRecentPatients(user.id, {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        riskLevel: riskLevel as string,
        hasAlerts: hasAlerts !== undefined ? hasAlerts === 'true' : undefined,
      });

      ResponseHandler.success(
        res,
        patients,
        'All patients retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/doctor/patients/:patientId
  getPatientById = async (
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
        throw new ValidationError('Access denied. Only doctors can view patient data.');
      }

      const { patientId } = req.params;
      const patientIdNum = parseInt(patientId);

      if (isNaN(patientIdNum)) {
        throw new ValidationError('Invalid patient ID');
      }

      const patient = await this.doctorPatientService.getPatientById(patientIdNum);

      ResponseHandler.success(
        res,
        patient,
        'Patient details retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 