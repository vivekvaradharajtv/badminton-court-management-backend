import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import * as billService from '../services/billService';
import * as paymentService from '../services/paymentService';
import { PaymentMethod } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK', 'OTHER'];

router.get(
  '/bills',
  [
    query('activity_id').optional().isUUID(),
    query('status').optional().isIn(['PAID', 'UPCOMING', 'DUE', 'OVERDUE']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const result = await billService.listBills({
      academyId: req.user.academyId,
      activityId: req.query.activity_id as string | undefined,
      status: req.query.status as 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE' | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    });
    res.json({ success: true, ...result });
  }
);

router.get(
  '/activities/:id/bills',
  [param('id').isUUID().withMessage('Invalid activity id')],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const activityId = req.params.id;
    await billService.ensureBillsForActivity(activityId, req.user.academyId);
    const result = await billService.listBills({
      academyId: req.user.academyId,
      activityId,
      limit: 100,
      offset: 0,
    });
    res.json({ success: true, ...result });
  }
);

router.post(
  '/bills/:billId/payments',
  [
    param('billId').isUUID().withMessage('Invalid bill id'),
    body('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
    body('payment_date').isISO8601().toDate().withMessage('payment_date required (YYYY-MM-DD)'),
    body('payment_method')
      .isIn(PAYMENT_METHODS)
      .withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}`),
    body('notes').optional().trim(),
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
      const result = await paymentService.recordPayment({
        academyId: req.user.academyId,
        billId: req.params.billId,
        amount: Number(req.body.amount),
        paymentDate: new Date(req.body.payment_date),
        paymentMethod: req.body.payment_method as PaymentMethod,
        notes: req.body.notes,
      });
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'NOT_FOUND') {
        res.status(404).json({ success: false, message: e.message, code: 'NOT_FOUND' });
        return;
      }
      if (e.code === 'VALIDATION_ERROR') {
        res.status(400).json({ success: false, message: e.message, code: 'VALIDATION_ERROR' });
        return;
      }
      throw err;
    }
  }
);

export default router;
