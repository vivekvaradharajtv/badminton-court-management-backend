import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import * as activityMemberService from '../services/activityMemberService';

const router = Router();
router.use(authMiddleware);

// POST /activities/:id/members is under activities router; this file handles PATCH /members/:id and DELETE /members/:id

const updateValidation = [
  param('id').isUUID().withMessage('Invalid member id'),
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('is_captain').optional().isBoolean(),
];

router.patch(
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
    const member = await activityMemberService.updateMember(
      req.params.id,
      req.user.academyId,
      {
        name: req.body.name,
        phone: req.body.phone,
        isCaptain: req.body.is_captain,
      }
    );
    if (!member) {
      res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, member });
  }
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid member id')],
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) return;
    const result = await activityMemberService.deleteMember(
      req.params.id,
      req.user.academyId
    );
    if (!result) {
      res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, message: 'Member removed' });
  }
);

export default router;
