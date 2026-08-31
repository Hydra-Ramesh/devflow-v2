import { Router } from 'express';
import { pubClient } from '../config/redis.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'realtime-service-v2',
    timestamp: new Date().toISOString(),
    dependencies: {
      redis: pubClient.status,
    }
  });
});

export default router;
