import { Role } from '@prisma/client';
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
export declare function register(input: RegisterInput): Promise<AuthResult>;
export declare function login(input: LoginInput): Promise<AuthResult>;
export declare function getMe(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: "ADMIN";
    academyId: string;
    academyName: string;
} | null>;
//# sourceMappingURL=authService.d.ts.map