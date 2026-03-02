"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Missing or invalid authorization header',
            code: 'UNAUTHORIZED',
        });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            academyId: decoded.academyId,
            role: decoded.role,
        };
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED',
        });
    }
}
//# sourceMappingURL=auth.js.map