import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

const registerValidation = [
  body('academyName').trim().notEmpty().withMessage('academyName is required'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('openingTime').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('openingTime must be HH:mm'),
  body('closingTime').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('closingTime must be HH:mm'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post(
  '/register',
  registerValidation,
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    try {
      const result = await authService.register({
        academyName: req.body.academyName,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        openingTime: req.body.openingTime,
        closingTime: req.body.closingTime,
      });
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'EMAIL_EXISTS') {
        res.status(400).json({ success: false, message: e.message, code: 'EMAIL_EXISTS' });
        return;
      }
      next(err);
    }
  })
);

router.post(
  '/login',
  loginValidation,
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    try {
      const result = await authService.login({
        email: req.body.email,
        password: req.body.password,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'INVALID_CREDENTIALS') {
        res.status(401).json({ success: false, message: e.message, code: 'INVALID_CREDENTIALS' });
        return;
      }
      next(err);
    }
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const profile = await authService.getMe(req.user.userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, profile });
  })
);

export default router;
