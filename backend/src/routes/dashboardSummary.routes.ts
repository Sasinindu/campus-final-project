import { Router } from 'express';
import { DashboardSummaryController } from '../controllers/DashboardSummaryController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const dashboardSummaryController = new DashboardSummaryController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/dashboard/summary - Get dashboard summary
router.get('/summary', dashboardSummaryController.getDashboardSummary);

export default router; 