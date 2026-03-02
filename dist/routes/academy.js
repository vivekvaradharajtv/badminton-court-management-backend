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
const academyService = __importStar(require("../services/academyService"));
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/settings', async (req, res) => {
    if (!req.user)
        return;
    const settings = await academyService.getAcademySettings(req.user.academyId);
    if (!settings) {
        res.status(404).json({ success: false, message: 'Academy not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, settings });
});
router.put('/settings', [
    (0, express_validator_1.body)('opening_time').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('opening_time must be HH:mm'),
    (0, express_validator_1.body)('closing_time').optional().trim().matches(/^\d{1,2}:\d{2}$/).withMessage('closing_time must be HH:mm'),
    (0, express_validator_1.body)('slot_duration').optional().isInt({ min: 5, max: 240 }).withMessage('slot_duration must be 5-240 minutes'),
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
    const settings = await academyService.updateAcademySettings(req.user.academyId, {
        opening_time: req.body.opening_time,
        closing_time: req.body.closing_time,
        slot_duration: req.body.slot_duration,
    });
    if (!settings) {
        res.status(404).json({ success: false, message: 'Academy not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, settings });
});
exports.default = router;
//# sourceMappingURL=academy.js.map