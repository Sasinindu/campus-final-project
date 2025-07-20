import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import FileController from '../controllers/fileController';

const router = Router();

router.post('/get-presigned-url', authenticateJWT, (req, res) =>
  FileController.getPresignedUrl(req, res),
);

export default router;
