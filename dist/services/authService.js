"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;
async function register(input) {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existingUser) {
        const err = new Error('Email already registered');
        err.code = 'EMAIL_EXISTS';
        throw err;
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
    const academy = await prisma_1.prisma.academy.create({
        data: { name: input.academyName },
    });
    const user = await prisma_1.prisma.user.create({
        data: {
            academyId: academy.id,
            name: input.name,
            email: input.email,
            passwordHash,
            role: 'ADMIN',
        },
    });
    const payload = {
        userId: user.id,
        academyId: user.academyId,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            academyId: user.academyId,
            academyName: academy.name,
        },
    };
}
async function login(input) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: input.email },
        include: { academy: true },
    });
    if (!user) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }
    const valid = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!valid) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }
    const payload = {
        userId: user.id,
        academyId: user.academyId,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            academyId: user.academyId,
            academyName: user.academy.name,
        },
    };
}
async function getMe(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            academyId: true,
            academy: { select: { name: true } },
        },
    });
    if (!user)
        return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        academyId: user.academyId,
        academyName: user.academy.name,
    };
}
//# sourceMappingURL=authService.js.map