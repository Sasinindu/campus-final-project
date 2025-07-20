import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';

const router = Router();
const patientController = new PatientController();

// GET /api/patients - Get all patients with pagination and filters
router.get('/', patientController.getPatients);

// GET /api/patients/stats - Get patient statistics
router.get('/stats', patientController.getPatientStats);

// GET /api/patients/doctor/:doctorId - Get patients by doctor
router.get('/doctor/:doctorId', patientController.getPatientsByDoctor);

// GET /api/patients/patient-id/:patientId - Get patient by patient ID
router.get('/patient-id/:patientId', patientController.getPatientByPatientId);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', patientController.getPatientById);

// GET /api/patients/:id/health-metrics - Get patient health metrics
router.get('/:id/health-metrics', patientController.getPatientHealthMetrics);

// GET /api/patients/:id/ai-predictions - Get patient AI predictions
router.get('/:id/ai-predictions', patientController.getPatientAIPredictions);

// POST /api/patients - Create new patient
router.post('/', patientController.createPatient);

// PUT /api/patients/:id - Update patient
router.put('/:id', patientController.updatePatient);

// PATCH /api/patients/:id/deactivate - Deactivate patient
router.patch('/:id/deactivate', patientController.deactivatePatient);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', patientController.deletePatient);

export default router;
