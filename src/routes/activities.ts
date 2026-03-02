import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import * as activityService from '../services/activityService';
import * as activityMemberService from '../services/activityMemberService';

const router = Router();
router.use(authMiddleware);

const createValidation = [
  body('court_id').isUUID().withMessage('court_id is required and must be UUID'),
  body('name').optional().trim(),
  body('start_time').trim().notEmpty().withMessage('start_time is required (HH:mm)'),
  body('end_time').trim().notEmpty().withMessage('end_time is required (HH:mm)'),
  body('start_date').isISO8601().toDate().withMessage('start_date is required (YYYY-MM-DD)'),
  body('monthly_fee').isFloat({ min: 0.01 }).withMessage('monthly_fee must be > 0'),
  body('max_players').isInt({ min: 1 }).withMessage('max_players must be > 0'),
  body('is_active').optional().isBoolean(),
];

const updateValidation = [
  param('id').isUUID(),
  body('name').optional().trim(),
  body('start_time').optional().trim().notEmpty(),
  body('end_time').optional().trim().notEmpty(),
  body('monthly_fee').optional().isFloat({ min: 0.01 }),
  body('max_players').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean(),
  body('court_id').optional().isUUID(),
];

router.post(
  '/',
  createValidation,
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
    try {
      const activity = await activityService.createActivity({
        academyId: req.user.academyId,
        courtId: req.body.court_id,
        name: req.body.name,
        startTime: req.body.start_time,
        endTime: req.body.end_time,
        startDate: new Date(req.body.start_date),
        monthlyFee: Number(req.body.monthly_fee),
        maxPlayers: Number(req.body.max_players),
        isActive: req.body.is_active,
      });
      res.status(201).json({ success: true, activity });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'OVERLAP') {
        res.status(400).json({ success: false, message: e.message, code: 'OVERLAP' });
        return;
      }
      if (e.code === 'NOT_FOUND') {
        res.status(404).json({ success: false, message: e.message, code: 'NOT_FOUND' });
        return;
      }
      throw err;
    }
  }
);

router.get(
  '/',
  [
    query('court_id').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const result = await activityService.listActivities({
      academyId: req.user.academyId,
      courtId: req.query.court_id as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    });
    res.json({ success: true, ...result });
  }
);

router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const activity = await activityService.getActivityById(req.params.id, req.user.academyId);
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, activity });
  }
);

router.put(
  '/:id',
  updateValidation,
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
    try {
      const activity = await activityService.updateActivity(
        req.params.id,
        req.user.academyId,
        {
          name: req.body.name,
          startTime: req.body.start_time,
          endTime: req.body.end_time,
          monthlyFee: req.body.monthly_fee != null ? Number(req.body.monthly_fee) : undefined,
          maxPlayers: req.body.max_players != null ? Number(req.body.max_players) : undefined,
          isActive: req.body.is_active,
          courtId: req.body.court_id,
        }
      );
      if (!activity) {
        res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
        return;
      }
      res.json({ success: true, activity });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'OVERLAP' || e.code === 'VALIDATION_ERROR') {
        res.status(400).json({ success: false, message: e.message, code: e.code });
        return;
      }
      throw err;
    }
  }
);

router.post(
  '/:id/members',
  [
    param('id').isUUID(),
    body('name').trim().notEmpty().withMessage('name is required'),
    body('phone').optional().trim(),
    body('is_captain').optional().isBoolean(),
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
    try {
      const member = await activityMemberService.addMember({
        academyId: req.user.academyId,
        activityId: req.params.id,
        name: req.body.name,
        phone: req.body.phone,
        isCaptain: req.body.is_captain,
      });
      res.status(201).json({ success: true, member });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'NOT_FOUND') {
        res.status(404).json({ success: false, message: e.message, code: 'NOT_FOUND' });
        return;
      }
      throw err;
    }
  }
);

router.get(
  '/:id/members',
  [param('id').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const members = await activityMemberService.listMembers(
      req.params.id,
      req.user.academyId
    );
    if (members === null) {
      res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, members });
  }
);

router.patch(
  '/:id/deactivate',
  [param('id').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const activity = await activityService.deactivateActivity(
      req.params.id,
      req.user.academyId
    );
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, activity });
  }
);

export default router;
