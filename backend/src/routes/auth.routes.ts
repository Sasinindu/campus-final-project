import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import AuthController from '../controllers/authController';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/validate-token', authenticateJWT, AuthController.validateToken);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;
