import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import * as academyService from '../services/academyService';

const router = Router();
router.use(authMiddleware);

router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  if (!req.user) return;
  const settings = await academyService.getAcademySettings(req.user.academyId);
  if (!settings) {
    res.status(404).json({ success: false, message: 'Academy not found', code: 'NOT_FOUND' });
    return;
  }
  res.json({ success: true, settings });
});

router.put(
  '/settings',
  [
    body('opening_time').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('opening_time must be HH:mm'),
    body('closing_time').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('closing_time must be HH:mm'),
    body('slot_duration').optional().isInt({ min: 5, max: 240 }).withMessage('slot_duration must be 5-240 minutes'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        errors: errors.array(),
      });
      return;
    }
    if (!req.user) return;
    const settings = await academyService.updateAcademySettings(req.user.academyId, {
      opening_time: req.body.opening_time,
      closing_time: req.body.closing_time,
      slot_duration: req.body.slot_duration,
    });
    if (!settings) {
      res.status(404).json({ success: false, message: 'Academy not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, settings });
  }
);

export default router;
