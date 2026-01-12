import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import * as jwt from 'jsonwebtoken';
import { env } from '@jurisnexo/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly db: DatabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            // Tenant Check
            const payload: any = jwt.verify(token, env.JWT_SECRET as string);
            (request as any).user = payload;

            const tenantId = payload.tenant_id;
            if (tenantId) {
                const { data: tenant } = await this.db.client
                    .from('tenants')
                    .select('status, disabled_reason')
                    .eq('id', tenantId)
                    .single();

                if (tenant && tenant.status === 'DISABLED') {
                    throw new ForbiddenException(`Tenant access disabled: ${tenant.disabled_reason || 'Contact support'}`);
                }
            }
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
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
