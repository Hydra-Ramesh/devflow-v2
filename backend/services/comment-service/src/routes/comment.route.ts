import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, commentController.createComment);
router.put('/:id', requireAuth, commentController.updateComment);
router.delete('/:id', requireAuth, commentController.deleteComment);
router.get('/', commentController.getComments);

export { router as commentRoutes };
