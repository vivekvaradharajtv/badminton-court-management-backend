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
const billService = __importStar(require("../services/billService"));
const paymentService = __importStar(require("../services/paymentService"));
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
const PAYMENT_METHODS = ['CASH', 'UPI', 'BANK', 'OTHER'];
router.get('/bills', [
    (0, express_validator_1.query)('activity_id').optional().isUUID(),
    (0, express_validator_1.query)('status').optional().isIn(['PAID', 'UPCOMING', 'DUE', 'OVERDUE']),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
    if (!req.user)
        return;
    const result = await billService.listBills({
        academyId: req.user.academyId,
        activityId: req.query.activity_id,
        status: req.query.status,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        offset: req.query.offset ? Number(req.query.offset) : 0,
    });
    res.json({ success: true, ...result });
});
router.get('/activities/:id/bills', [(0, express_validator_1.param)('id').isUUID().withMessage('Invalid activity id')], async (req, res) => {
    if (!req.user)
        return;
    const activityId = req.params.id;
    await billService.ensureBillsForActivity(activityId, req.user.academyId);
    const result = await billService.listBills({
        academyId: req.user.academyId,
        activityId,
        limit: 100,
        offset: 0,
    });
    res.json({ success: true, ...result });
});
router.post('/bills/:billId/payments', [
    (0, express_validator_1.param)('billId').isUUID().withMessage('Invalid bill id'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
    (0, express_validator_1.body)('payment_date').isISO8601().toDate().withMessage('payment_date required (YYYY-MM-DD)'),
    (0, express_validator_1.body)('payment_method')
        .isIn(PAYMENT_METHODS)
        .withMessage(`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}`),
    (0, express_validator_1.body)('notes').optional().trim(),
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
        const result = await paymentService.recordPayment({
            academyId: req.user.academyId,
            billId: req.params.billId,
            amount: Number(req.body.amount),
            paymentDate: new Date(req.body.payment_date),
            paymentMethod: req.body.payment_method,
            notes: req.body.notes,
        });
        res.status(201).json({ success: true, ...result });
    }
    catch (err) {
        const e = err;
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
});
exports.default = router;
//# sourceMappingURL=bills.js.map