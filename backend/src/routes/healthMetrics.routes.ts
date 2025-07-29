import { Router } from 'express';
import { HealthMetricController } from '../controllers/HealthMetricController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const healthMetricController = new HealthMetricController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/health-metrics/patient/:patientId - Get all health metrics for a patient
router.get('/patient/:patientId', healthMetricController.getPatientHealthMetrics);

// GET /api/health-metrics/patient/:patientId/latest - Get latest health metrics for a patient
router.get('/patient/:patientId/latest', healthMetricController.getLatestHealthMetrics);

// GET /api/health-metrics/patient/:patientId/trends - Get health metric trends for a patient
router.get('/patient/:patientId/trends', healthMetricController.getHealthMetricTrends);

// GET /api/health-metrics/:id - Get health metric by ID
router.get('/:id', healthMetricController.getHealthMetricById);

// POST /api/health-metrics - Create new health metric
router.post('/', healthMetricController.createHealthMetric);

// PUT /api/health-metrics/:id - Update health metric
router.put('/:id', healthMetricController.updateHealthMetric);

// DELETE /api/health-metrics/:id - Delete health metric
router.delete('/:id', healthMetricController.deleteHealthMetric);

export default router; 