import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/PatientService';
import { ResponseHandler } from '../utils/responseHandler';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PaginationParams,
  PatientFilters,
} from '../types';
import { ValidationError } from '../utils/errors';

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  // GET /api/patients
  getPatients = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'created_at',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      };

      const filters: PatientFilters = {
        region: req.query.region as string,
        doctor_id: req.query.doctor_id
          ? parseInt(req.query.doctor_id as string)
          : undefined,
        is_active:
          req.query.is_active !== undefined
            ? req.query.is_active === 'true'
            : undefined,
        search: req.query.search as string,
      };

      const result = await this.patientService.getPatients(pagination, filters);

      ResponseHandler.paginated(
        res,
        result.data,
        result.pagination,
        'Patients retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/:id
  getPatientById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Patient ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid patient ID');
      }

      const patient = await this.patientService.getPatientById(id);

      ResponseHandler.success(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/patient-id/:patientId
  getPatientByPatientId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientId = req.params.patientId;

      if (!patientId) {
        throw new ValidationError('Patient ID is required');
      }

      const patient =
        await this.patientService.getPatientByPatientId(patientId);

      ResponseHandler.success(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/patients
  createPatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientData: CreatePatientDto = req.body;

      // Validate required fields
      if (
        !patientData.patient_id ||
        !patientData.first_name ||
        !patientData.last_name ||
        !patientData.date_of_birth ||
        !patientData.gender
      ) {
        throw new ValidationError('Missing required fields');
      }

      // Validate gender
      const validGenders = ['M', 'F', 'O'];
      if (!validGenders.includes(patientData.gender)) {
        throw new ValidationError('Invalid gender');
      }

      // Validate blood type if provided
      if (patientData.blood_type) {
        const validBloodTypes = [
          'A+',
          'A-',
          'B+',
          'B-',
          'AB+',
          'AB-',
          'O+',
          'O-',
        ];
        if (!validBloodTypes.includes(patientData.blood_type)) {
          throw new ValidationError('Invalid blood type');
        }
      }

      const patient = await this.patientService.createPatient(patientData);

      ResponseHandler.created(res, patient, 'Patient created successfully');
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/patients/:id
  updatePatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Patient ID is required');
      }
      const id = parseInt(idParam, 10);
      const updateData: UpdatePatientDto = req.body;

      if (isNaN(id)) {
        throw new ValidationError('Invalid patient ID');
      }

      // Validate gender if provided
      if (updateData.gender) {
        const validGenders = ['M', 'F', 'O'];
        if (!validGenders.includes(updateData.gender)) {
          throw new ValidationError('Invalid gender');
        }
      }

      // Validate blood type if provided
      if (updateData.blood_type) {
        const validBloodTypes = [
          'A+',
          'A-',
          'B+',
          'B-',
          'AB+',
          'AB-',
          'O+',
          'O-',
        ];
        if (!validBloodTypes.includes(updateData.blood_type)) {
          throw new ValidationError('Invalid blood type');
        }
      }

      const patient = await this.patientService.updatePatient(id, updateData);

      ResponseHandler.success(res, patient, 'Patient updated successfully');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/patients/:id
  deletePatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Patient ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid patient ID');
      }

      await this.patientService.deletePatient(id);

      ResponseHandler.success(res, null, 'Patient deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/patients/:id/deactivate
  deactivatePatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Patient ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid patient ID');
      }

      const patient = await this.patientService.deactivatePatient(id);

      ResponseHandler.success(res, patient, 'Patient deactivated successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/doctor/:doctorId
  getPatientsByDoctor = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorIdParam = req.params.doctorId;
      if (!doctorIdParam) {
        throw new ValidationError('Doctor ID is required');
      }
      const doctorId = parseInt(doctorIdParam);

      if (isNaN(doctorId)) {
        throw new ValidationError('Invalid doctor ID');
      }

      const patients = await this.patientService.getPatientsByDoctor(doctorId);

      ResponseHandler.success(res, patients, 'Patients retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/stats
  getPatientStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const stats = await this.patientService.getPatientStats();

      ResponseHandler.success(
        res,
        stats,
        'Patient statistics retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/:id/health-metrics
  getPatientHealthMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientIdParam = req.params.id;
      if (!patientIdParam) {
        throw new ValidationError('Patient ID is required');
      }
      const patientId = parseInt(patientIdParam);

      if (isNaN(patientId)) {
        throw new ValidationError('Invalid patient ID');
      }

      // This would be implemented in a HealthMetricService
      // For now, we'll return a placeholder
      ResponseHandler.success(res, [], 'Health metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/patients/:id/ai-predictions
  getPatientAIPredictions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const patientIdParam = req.params.id;
      if (!patientIdParam) {
        throw new ValidationError('Patient ID is required');
      }
      const patientId = parseInt(patientIdParam);

      if (isNaN(patientId)) {
        throw new ValidationError('Invalid patient ID');
      }

      // This would be implemented in an AIPredictionService
      // For now, we'll return a placeholder
      ResponseHandler.success(res, [], 'AI predictions retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
