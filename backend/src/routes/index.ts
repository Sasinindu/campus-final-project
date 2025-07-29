import { Router } from 'express';
import authRoutes from './auth.routes';
import attachmentRoutes from './attachment.routes';
import patientRoutes from './patient.routes';
import healthAuthRoutes from './healthAuth.routes';
import dashboardRoutes from './dashboard.routes';
import healthMetricsRoutes from './healthMetrics.routes';
import medicationRoutes from './medication.routes';
import doctorPatientRoutes from './doctorPatient.routes';
import aiPredictionsRoutes from './aiPredictions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/attachment', attachmentRoutes);
router.use('/patients', patientRoutes);
router.use('/health/auth', healthAuthRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health-metrics', healthMetricsRoutes);
router.use('/medications', medicationRoutes);
router.use('/doctor/patients', doctorPatientRoutes);
router.use('/ai-predictions', aiPredictionsRoutes);

export default router;
