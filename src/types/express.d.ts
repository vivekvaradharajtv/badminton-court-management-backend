import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        academyId: string;
        role: Role;
      };
    }
  }
}

export {};
