import { Router } from 'express';
import { MedicationController } from '../controllers/MedicationController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const medicationController = new MedicationController();

// Apply auth middleware to all routes
router.use(authenticateJWT);

// GET /api/medications
router.get('/', medicationController.getAllMedications);

// GET /api/medications/:id
router.get('/:id', medicationController.getMedicationById);

// GET /api/medications/patient/:patientId
router.get('/patient/:patientId', medicationController.getMedicationsByPatient);

// POST /api/medications
router.post('/', medicationController.createMedication);

// PUT /api/medications/:id
router.put('/:id', medicationController.updateMedication);

// DELETE /api/medications/:id
router.delete('/:id', medicationController.deleteMedication);

// PATCH /api/medications/:id/status
router.patch('/:id/status', medicationController.updateMedicationStatus);

export default router; 