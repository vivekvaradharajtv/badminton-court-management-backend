import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import * as courtService from '../services/courtService';

const router = Router();
router.use(authMiddleware);

const createValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
];

const updateValidation = [
  param('id').isUUID().withMessage('Invalid court id'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const court = await courtService.createCourt({
      academyId: req.user.academyId,
      name: req.body.name,
      isActive: req.body.is_active,
    });
    res.status(201).json({ success: true, court });
  }
);

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const result = await courtService.listCourts({
      academyId: req.user.academyId,
      limit,
      offset,
    });
    res.json({ success: true, ...result });
  }
);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
router.get(
  '/available-slots',
  [
    query('court_ids').optional().isString(),
    query('start_time').optional().matches(TIME_REGEX).withMessage('start_time must be HH:mm'),
    query('hours').optional().isFloat({ min: 0.5, max: 24 }).toFloat().withMessage('hours must be 0.5–24'),
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    let courtIds: string[] | undefined;
    const raw = req.query.court_ids;
    if (typeof raw === 'string' && raw.trim()) {
      courtIds = raw.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = courtIds.filter((id) => !UUID_REGEX.test(id));
      if (invalid.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid court id(s); each must be a UUID',
          code: 'VALIDATION_ERROR',
        });
        return;
      }
    }
    const startTime = typeof req.query.start_time === 'string' ? req.query.start_time.trim() : undefined;
    const hoursParam = req.query.hours;
    const hours = hoursParam !== undefined && hoursParam !== '' ? Number(hoursParam) : undefined;
    if (startTime != null && (hours == null || hours <= 0)) {
      res.status(400).json({
        success: false,
        message: 'When start_time is provided, hours must be a positive number (0.5–24)',
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    if (hours != null && hours > 0 && !startTime) {
      res.status(400).json({
        success: false,
        message: 'When hours is provided, start_time must be provided (HH:mm)',
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    const result = await courtService.getAvailableSlotsForCourts(req.user.academyId, {
      courtIds,
      startTime,
      hours,
    });
    res.json({ success: true, courts: result.courts });
  }
);

router.get(
  '/:id/slots',
  [
    param('id').isUUID().withMessage('Invalid court id'),
    query('date').optional().isISO8601().toDate().withMessage('date must be YYYY-MM-DD'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const dateParam = req.query.date;
    const date = dateParam ? new Date(dateParam as string) : undefined;
    const result = await courtService.getCourtSlots(
      req.params.id,
      req.user.academyId,
      date
    );
    if (!result) {
      res.status(404).json({ success: false, message: 'Court not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, ...result });
  }
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid court id')],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const court = await courtService.getCourtById(req.params.id, req.user.academyId);
    if (!court) {
      res.status(404).json({ success: false, message: 'Court not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, court });
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const court = await courtService.updateCourt(
      req.params.id,
      req.user.academyId,
      {
        name: req.body.name,
        isActive: req.body.is_active,
      }
    );
    if (!court) {
      res.status(404).json({ success: false, message: 'Court not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, court });
  }
);

export default router;
