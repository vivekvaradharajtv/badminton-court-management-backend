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
const courtService = __importStar(require("../services/courtService"));
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
const createValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('name is required'),
    (0, express_validator_1.body)('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
];
const updateValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid court id'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    (0, express_validator_1.body)('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
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
});
router.get('/', [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
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
});
router.get('/:id/slots', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid court id'),
    (0, express_validator_1.query)('date').optional().isISO8601().toDate().withMessage('date must be YYYY-MM-DD'),
], async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
    }
    const dateParam = req.query.date;
    const date = dateParam ? new Date(dateParam) : undefined;
    const result = await courtService.getCourtSlots(req.params.id, req.user.academyId, date);
    if (!result) {
        res.status(404).json({ success: false, message: 'Court not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, ...result });
});
router.get('/:id', [(0, express_validator_1.param)('id').isUUID().withMessage('Invalid court id')], async (req, res) => {
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
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
    }
    const court = await courtService.updateCourt(req.params.id, req.user.academyId, {
        name: req.body.name,
        isActive: req.body.is_active,
    });
    if (!court) {
        res.status(404).json({ success: false, message: 'Court not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, court });
});
exports.default = router;
//# sourceMappingURL=courts.js.map