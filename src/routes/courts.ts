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
