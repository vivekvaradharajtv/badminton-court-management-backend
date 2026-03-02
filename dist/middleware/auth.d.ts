import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    academyId: string;
    role: Role;
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map