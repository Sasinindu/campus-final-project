import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const dashboardController = new DashboardController();

// GET /api/dashboard/summary - Get dashboard summary
router.get('/summary', dashboardController.getDashboardSummary);

// GET /api/dashboard/doctor - Get doctor dashboard
router.get('/doctor', dashboardController.getDoctorDashboard);

// GET /api/dashboard/patient/:patientId - Get patient dashboard
router.get('/patient/:patientId', dashboardController.getPatientDashboard);

// GET /api/dashboard/official - Get official dashboard
router.get('/official', dashboardController.getOfficialDashboard);

export default router;
