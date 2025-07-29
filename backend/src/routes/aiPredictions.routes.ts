import { Router } from 'express';
import { AIPredictionController } from '../controllers/AIPredictionController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const aiPredictionController = new AIPredictionController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/ai-predictions - Get all AI predictions with filters
router.get('/', aiPredictionController.getAIPredictions);

// GET /api/ai-predictions/:predictionId - Get specific AI prediction
router.get('/:predictionId', aiPredictionController.getAIPredictionById);

// PATCH /api/ai-predictions/:predictionId/review - Review AI prediction
router.patch('/:predictionId/review', aiPredictionController.reviewAIPrediction);

export default router; 