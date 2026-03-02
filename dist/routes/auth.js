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
const authService = __importStar(require("../services/authService"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('academyName').trim().notEmpty().withMessage('academyName is required'),
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('name is required'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
router.post('/register', registerValidation, async (req, res) => {
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
    try {
        const result = await authService.register({
            academyName: req.body.academyName,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        res.status(201).json({ success: true, ...result });
    }
    catch (err) {
        const e = err;
        if (e.code === 'EMAIL_EXISTS') {
            res.status(400).json({ success: false, message: e.message, code: 'EMAIL_EXISTS' });
            return;
        }
        throw err;
    }
});
router.post('/login', loginValidation, async (req, res) => {
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
    try {
        const result = await authService.login({
            email: req.body.email,
            password: req.body.password,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        const e = err;
        if (e.code === 'INVALID_CREDENTIALS') {
            res.status(401).json({ success: false, message: e.message, code: 'INVALID_CREDENTIALS' });
            return;
        }
        throw err;
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
    }
    const user = await authService.getMe(req.user.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, user });
});
exports.default = router;
//# sourceMappingURL=auth.js.map