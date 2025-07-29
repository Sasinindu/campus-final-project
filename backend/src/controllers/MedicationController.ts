import { Request, Response, NextFunction } from 'express';
import { MedicationService } from '../services/MedicationService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';

export class MedicationController {
  private medicationService: MedicationService;

  constructor() {
    this.medicationService = new MedicationService();
  }

  // GET /api/medications
  getAllMedications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, isActive } = req.query;
      
      const medications = await this.medicationService.getAllMedications({
        page: Number(page),
        limit: Number(limit),
        patientId: patientId ? Number(patientId) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      ResponseHandler.success(
        res,
        medications,
        'Medications retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/medications/:id
  getMedicationById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationId = parseInt(id);

      if (isNaN(medicationId)) {
        throw new ValidationError('Invalid medication ID');
      }

      const medication = await this.medicationService.getMedicationById(medicationId);

      ResponseHandler.success(
        res,
        medication,
        'Medication retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // GET /api/medications/patient/:patientId
  getMedicationsByPatient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { patientId } = req.params;
      const patientIdNum = parseInt(patientId);

      if (isNaN(patientIdNum)) {
        throw new ValidationError('Invalid patient ID');
      }

      const medications = await this.medicationService.getMedicationsByPatient(patientIdNum);

      ResponseHandler.success(
        res,
        medications,
        'Patient medications retrieved successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/medications
  createMedication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const medicationData = req.body;
      const medication = await this.medicationService.createMedication(medicationData);

      ResponseHandler.success(
        res,
        medication,
        'Medication created successfully',
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/medications/:id
  updateMedication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationId = parseInt(id);
      const updateData = req.body;

      if (isNaN(medicationId)) {
        throw new ValidationError('Invalid medication ID');
      }

      const medication = await this.medicationService.updateMedication(medicationId, updateData);

      ResponseHandler.success(
        res,
        medication,
        'Medication updated successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/medications/:id
  deleteMedication = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationId = parseInt(id);

      if (isNaN(medicationId)) {
        throw new ValidationError('Invalid medication ID');
      }

      await this.medicationService.deleteMedication(medicationId);

      ResponseHandler.success(
        res,
        null,
        'Medication deleted successfully',
      );
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/medications/:id/status
  updateMedicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const medicationId = parseInt(id);
      const { isActive } = req.body;

      if (isNaN(medicationId)) {
        throw new ValidationError('Invalid medication ID');
      }

      const medication = await this.medicationService.updateMedicationStatus(medicationId, isActive);

      ResponseHandler.success(
        res,
        medication,
        'Medication status updated successfully',
      );
    } catch (error) {
      next(error);
    }
  };
} 