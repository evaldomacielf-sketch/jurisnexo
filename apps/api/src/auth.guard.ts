import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { env } from '@jurisnexo/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = jwt.verify(token, env.JWT_SECRET as string);
            (request as any).user = payload; // Attach payload to request
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        // Check cookie first
        if (request.cookies && request.cookies.access_token) {
            return request.cookies.access_token;
        }
        // Check Header
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
