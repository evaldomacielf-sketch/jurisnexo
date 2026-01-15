import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ForbiddenException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TenantContextInterceptor.name);

    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();
        const user = request.user;

        // Skip if no user (should be handled by AuthGuard, but safety check)
        // If AuthGuard failed, we wouldn't be here usually (if global guard runs before interceptor)
        // Global Guard (APP_GUARD) runs BEFORE Global Interceptor (APP_INTERCEPTOR)?
        // NestJS Lifecycle: Middleware -> Guards -> Interceptors -> Pipes -> Controller -> Interceptors
        // Yes. So if we are here, AuthGuard passed.

        if (user) {
            const tenantId = user.tenantId; // Mapped in JwtStrategy

            if (!tenantId) {
                this.logger.warn(`User ${user.userId} has no tenantId`);
                throw new ForbiddenException('Tenant ID not found in token');
            }

            // Set header
            response.setHeader('X-Tenant-Id', tenantId);
        }

        return next.handle();
    }
}
