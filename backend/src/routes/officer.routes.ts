import { Router } from 'express';
import { OfficerController } from '../controllers/OfficerController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const officerController = new OfficerController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/officer/dashboard - Get officer dashboard
router.get('/dashboard', officerController.getOfficerDashboard);

// POST /api/officer/patients - Add new patient
router.post('/patients', officerController.addPatient);

// GET /api/officer/patients - Get all patients
router.get('/patients', officerController.getAllPatients);

// POST /api/officer/health-reports - Add health report
router.post('/health-reports', officerController.addHealthReport);

// GET /api/officer/patients/:patientId/health-reports - Get patient health reports
router.get('/patients/:patientId/health-reports', officerController.getPatientHealthReports);

export default router; 