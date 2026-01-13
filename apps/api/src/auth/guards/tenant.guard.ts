import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * TenantGuard
 * Ensures the user has a loaded Tenant ID in their request context.
 * Must run AFTER JwtAuthGuard.
 */
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) {
            // Could try to load default tenant if not present?
            // For now, strict check: API calls needing context must have it.
            throw new ForbiddenException('Tenant Context Required');
        }

        return true;
    }
}
