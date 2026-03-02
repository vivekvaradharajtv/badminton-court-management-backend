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
const activityMemberService = __importStar(require("../services/activityMemberService"));
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// POST /activities/:id/members is under activities router; this file handles PATCH /members/:id and DELETE /members/:id
const updateValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid member id'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('is_captain').optional().isBoolean(),
];
router.patch('/:id', updateValidation, async (req, res) => {
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
    const member = await activityMemberService.updateMember(req.params.id, req.user.academyId, {
        name: req.body.name,
        phone: req.body.phone,
        isCaptain: req.body.is_captain,
    });
    if (!member) {
        res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, member });
});
router.delete('/:id', [(0, express_validator_1.param)('id').isUUID().withMessage('Invalid member id')], async (req, res) => {
    if (!req.user)
        return;
    const result = await activityMemberService.deleteMember(req.params.id, req.user.academyId);
    if (!result) {
        res.status(404).json({ success: false, message: 'Member not found', code: 'NOT_FOUND' });
        return;
    }
    res.json({ success: true, message: 'Member removed' });
});
exports.default = router;
//# sourceMappingURL=members.js.map