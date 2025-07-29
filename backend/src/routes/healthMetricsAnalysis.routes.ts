import { Router } from 'express';
import { HealthMetricsAnalysisController } from '../controllers/HealthMetricsAnalysisController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const healthMetricsAnalysisController = new HealthMetricsAnalysisController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/health-metrics-analysis - Get health metrics analysis
router.get('/', healthMetricsAnalysisController.getHealthMetricsAnalysis);

export default router; 