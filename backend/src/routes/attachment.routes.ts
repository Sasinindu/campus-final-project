import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import AttachmentController from '../controllers/attachmentController';

const router = Router();

// Create a new attachment
router.post('/add', authenticateJWT, AttachmentController.createAttachment);

// Retrieve a single attachment by ID
router.get('/view/:id', authenticateJWT, AttachmentController.getAttachment);

// Retrieve all attachments
router.get('/list', authenticateJWT, AttachmentController.getAttachments);

router.post(
  '/media/list',
  authenticateJWT,
  AttachmentController.getMediaAttachmentWithURL,
);

// Update an attachment by ID
router.put(
  '/update/:id',
  authenticateJWT,
  AttachmentController.updateAttachment,
);

// Delete an attachment by ID
router.post('/delete', authenticateJWT, AttachmentController.deleteAttachment);

// Post API to get media attachments with pagination and filters
router.post('/media-files/list', AttachmentController.getMediaAttachments);



export default router;
