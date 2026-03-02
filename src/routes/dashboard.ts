import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as dashboardService from '../services/dashboardService';

const router = Router();
router.use(authMiddleware);

router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    return;
  }
  const summary = await dashboardService.getDashboardSummary(req.user.academyId);
  res.json({ success: true, summary });
});

export default router;
