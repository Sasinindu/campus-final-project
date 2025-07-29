import { Request, Response, NextFunction } from 'express';
import { HealthMetricService } from '../services/HealthMetricService';
import { ResponseHandler } from '../utils/responseHandler';
import { ValidationError } from '../utils/errors';

export class HealthMetricController {
  private healthMetricService: HealthMetricService;

  constructor() {
    this.healthMetricService = new HealthMetricService();
  }

  // GET /api/health-metrics/patient/:patientId
  getPatientHealthMetrics = async (
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

      const metrics = await this.healthMetricService.getPatientHealthMetrics(patientId);

      ResponseHandler.success(res, metrics, 'Health metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health-metrics/:id
  getHealthMetricById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Health metric ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid health metric ID');
      }

      const metric = await this.healthMetricService.getHealthMetricById(id);

      ResponseHandler.success(res, metric, 'Health metric retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/health-metrics
  createHealthMetric = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const metricData = req.body;

      // Validate required fields
      if (!metricData.patient_id || !metricData.metric_type) {
        throw new ValidationError('Patient ID and metric type are required');
      }

      const metric = await this.healthMetricService.createHealthMetric(metricData);

      ResponseHandler.created(res, metric, 'Health metric created successfully');
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/health-metrics/:id
  updateHealthMetric = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Health metric ID is required');
      }
      const id = parseInt(idParam);
      const updateData = req.body;

      if (isNaN(id)) {
        throw new ValidationError('Invalid health metric ID');
      }

      const metric = await this.healthMetricService.updateHealthMetric(id, updateData);

      ResponseHandler.success(res, metric, 'Health metric updated successfully');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/health-metrics/:id
  deleteHealthMetric = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new ValidationError('Health metric ID is required');
      }
      const id = parseInt(idParam);

      if (isNaN(id)) {
        throw new ValidationError('Invalid health metric ID');
      }

      await this.healthMetricService.deleteHealthMetric(id);

      ResponseHandler.success(res, null, 'Health metric deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health-metrics/patient/:patientId/latest
  getLatestHealthMetrics = async (
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

      const metrics = await this.healthMetricService.getLatestHealthMetrics(patientId);

      ResponseHandler.success(res, metrics, 'Latest health metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/health-metrics/patient/:patientId/trends
  getHealthMetricTrends = async (
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

      const trends = await this.healthMetricService.getHealthMetricTrends(patientId);

      ResponseHandler.success(res, trends, 'Health metric trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
} 