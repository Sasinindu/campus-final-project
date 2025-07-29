import { Router } from 'express';
import { AIHealthPredictionController } from '../controllers/AIHealthPredictionController';
import { AIHealthPredictionService } from '../services/AIHealthPredictionService';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { HealthMetric } from '../entities/HealthMetric';
import { AIPrediction } from '../entities/AIPrediction';

const router = Router();

// Initialize repositories
const patientRepository = AppDataSource.getRepository(Patient);
const healthMetricRepository = AppDataSource.getRepository(HealthMetric);
const aiPredictionRepository = AppDataSource.getRepository(AIPrediction);

// Initialize service and controller
const aiHealthPredictionService = new AIHealthPredictionService(
  patientRepository,
  healthMetricRepository,
  aiPredictionRepository
);
const aiHealthPredictionController = new AIHealthPredictionController(aiHealthPredictionService);

// Routes
router.post('/generate/:patientId', authenticateJWT, (req, res) => {
  aiHealthPredictionController.generatePrediction(req, res);
});

router.get('/patient/:patientId', authenticateJWT, (req, res) => {
  aiHealthPredictionController.getPatientPredictions(req, res);
});

router.put('/:predictionId', authenticateJWT, (req, res) => {
  aiHealthPredictionController.updatePrediction(req, res);
});

export default router; 