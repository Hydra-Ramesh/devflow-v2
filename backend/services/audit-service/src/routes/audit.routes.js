import { Router } from 'express';
import { AuditController } from '../controller/audit.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', requireAdmin, AuditController.getStats);
router.get('/user/:userId', requireAdmin, AuditController.getUserLogs);
router.get('/', requireAdmin, AuditController.getLogs);

export default router;
