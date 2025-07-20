import { Router } from 'express';
import { HealthAuthController } from '../controllers/HealthAuthController';

const router = Router();
const healthAuthController = new HealthAuthController();

// POST /api/health/auth/register - Register new user
router.post('/register', healthAuthController.register);

// POST /api/health/auth/login - Login user
router.post('/login', healthAuthController.login);

// GET /api/health/auth/profile - Get user profile
router.get('/profile', healthAuthController.getProfile);

// PUT /api/health/auth/profile - Update user profile
router.put('/profile', healthAuthController.updateProfile);

// GET /api/health/auth/users - Get users (with optional role filter)
router.get('/users', healthAuthController.getUsers);

// GET /api/health/auth/users/:id - Get user by ID
router.get('/users/:id', healthAuthController.getUserById);

// GET /api/health/auth/stats - Get user statistics
router.get('/stats', healthAuthController.getUserStats);

export default router;
