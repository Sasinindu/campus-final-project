import { Router } from 'express';
import authRoutes from './auth.routes';
import fileRoutes from './file.routes';
import attachmentRoutes from './attachment.routes';
import patientRoutes from './patient.routes';
import healthAuthRoutes from './healthAuth.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/file', fileRoutes);
router.use('/attachment', attachmentRoutes);
router.use('/patients', patientRoutes);
router.use('/health/auth', healthAuthRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
