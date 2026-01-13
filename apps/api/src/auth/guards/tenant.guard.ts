import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Verificar se tenantId no JWT corresponde ao tenant do recurso
        const resourceTenantId = request.params.tenantId || request.body.tenantId;

        if (resourceTenantId && user.tenantId !== resourceTenantId) {
            throw new ForbiddenException('Acesso negado a recursos de outro tenant');
        }

        return true;
    }
}
