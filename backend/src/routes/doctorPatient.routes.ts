import { Router } from 'express';
import { DoctorPatientController } from '../controllers/DoctorPatientController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const doctorPatientController = new DoctorPatientController();

// Apply auth middleware to all routes
router.use(authenticateJWT);

// GET /api/doctor/patients
router.get('/', doctorPatientController.getRecentPatients);

// GET /api/doctor/patients/:patientId
router.get('/:patientId', doctorPatientController.getPatientById);

export default router; 