import { Request } from 'express';

export interface AuthenticatedUser {
    id: string;
    email: string;
    tenantId: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
