import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { JwtPayload } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

const DEFAULT_OPENING_TIME = '06:00';
const DEFAULT_CLOSING_TIME = '22:00';
const DEFAULT_SLOT_DURATION_MINS = 60;

export interface RegisterInput {
  academyName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    academyId: string;
    academyName?: string;
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    const err = new Error('Email already registered');
    (err as Error & { code?: string }).code = 'EMAIL_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const academy = await prisma.academy.create({
    data: {
      name: input.academyName,
      openingTime: DEFAULT_OPENING_TIME,
      closingTime: DEFAULT_CLOSING_TIME,
      slotDurationMins: DEFAULT_SLOT_DURATION_MINS,
    },
  });

  const user = await prisma.user.create({
    data: {
      academyId: academy.id,
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  const payload: JwtPayload = {
    userId: user.id,
    academyId: user.academyId,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

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

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { academy: true },
  });
  if (!user) {
    const err = new Error('Invalid email or password');
    (err as Error & { code?: string }).code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    (err as Error & { code?: string }).code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const payload: JwtPayload = {
    userId: user.id,
    academyId: user.academyId,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

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

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
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
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    academyId: user.academyId,
    academyName: user.academy.name,
  };
}
