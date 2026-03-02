"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const activityService = __importStar(require("../services/activityService"));
const activityMemberService = __importStar(require("../services/activityMemberService"));
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
const createValidation = [
    (0, express_validator_1.body)('court_id').isUUID().withMessage('court_id is required and must be UUID'),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('start_time').trim().notEmpty().withMessage('start_time is required (HH:mm)'),
    (0, express_validator_1.body)('end_time').trim().notEmpty().withMessage('end_time is required (HH:mm)'),
    (0, express_validator_1.body)('start_date').isISO8601().toDate().withMessage('start_date is required (YYYY-MM-DD)'),
    (0, express_validator_1.body)('monthly_fee').isFloat({ min: 0.01 }).withMessage('monthly_fee must be > 0'),
    (0, express_validator_1.body)('max_players').isInt({ min: 1 }).withMessage('max_players must be > 0'),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
];
const updateValidation = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('start_time').optional().trim().notEmpty(),
    (0, express_validator_1.body)('end_time').optional().trim().notEmpty(),
    (0, express_validator_1.body)('monthly_fee').optional().isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('max_players').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('court_id').optional().isUUID(),
];
router.post('/', createValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors: errors.array(),
        });
        return;
    }
    if (!req.user)
        return;
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
    }
    catch (err) {
        const e = err;
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
});
router.get('/', [
    (0, express_validator_1.query)('court_id').optional().isUUID(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
    if (!req.user)
        return;
    const result = await activityService.listActivities({
        academyId: req.user.academyId,
        courtId: req.query.court_id,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0,
    });
    res.json({ success: true, ...result });
});
router.get('/:id', [(0, express_validator_1.param)('id').isUUID()], async (req, res) => {
    if (!req.user)
        return;
    const activity = await activityService.getActivityById(req.params.id, req.user.academyId);
    if (!activity) {
        res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, activity });
});
router.put('/:id', updateValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors: errors.array(),
        });
        return;
    }
    if (!req.user)
        return;
    try {
        const activity = await activityService.updateActivity(req.params.id, req.user.academyId, {
            name: req.body.name,
            startTime: req.body.start_time,
            endTime: req.body.end_time,
            monthlyFee: req.body.monthly_fee != null ? Number(req.body.monthly_fee) : undefined,
            maxPlayers: req.body.max_players != null ? Number(req.body.max_players) : undefined,
            isActive: req.body.is_active,
            courtId: req.body.court_id,
        });
        if (!activity) {
            res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
            return;
        }
        res.json({ success: true, activity });
    }
    catch (err) {
        const e = err;
        if (e.code === 'OVERLAP' || e.code === 'VALIDATION_ERROR') {
            res.status(400).json({ success: false, message: e.message, code: e.code });
            return;
        }
        throw err;
    }
});
router.post('/:id/members', [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('name is required'),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('is_captain').optional().isBoolean(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors: errors.array(),
        });
        return;
    }
    if (!req.user)
        return;
    try {
        const member = await activityMemberService.addMember({
            academyId: req.user.academyId,
            activityId: req.params.id,
            name: req.body.name,
            phone: req.body.phone,
            isCaptain: req.body.is_captain,
        });
        res.status(201).json({ success: true, member });
    }
    catch (err) {
        const e = err;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json({ success: false, message: e.message, code: 'NOT_FOUND' });
            return;
        }
        throw err;
    }
});
router.get('/:id/members', [(0, express_validator_1.param)('id').isUUID()], async (req, res) => {
    if (!req.user)
        return;
    const members = await activityMemberService.listMembers(req.params.id, req.user.academyId);
    if (members === null) {
        res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, members });
});
router.patch('/:id/deactivate', [(0, express_validator_1.param)('id').isUUID()], async (req, res) => {
    if (!req.user)
        return;
    const activity = await activityService.deactivateActivity(req.params.id, req.user.academyId);
    if (!activity) {
        res.status(404).json({ success: false, message: 'Activity not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, activity });
});
exports.default = router;
//# sourceMappingURL=activities.js.map