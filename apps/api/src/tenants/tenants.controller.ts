import { Controller, Post, Body, Get, Delete, Param, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth.guard'; // I need to create this!
// Or use request object assuming middleware puts user?
// I haven't created a Guard yet. The Prompt 4 ended with Controller/Service. 
// I should create a JWT Auth Guard to extract user from Access Token cookie/header.

@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService,
        private readonly authService: AuthService,
    ) { }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Body('name') name: string, @Request() req: any) {
        console.log(`[TenantsController] Create request for: ${name}, User: ${req.user?.sub}`);
        // For now mocking user ID from request until Guard implemented.
        // In real flow: req.user.sub
        if (!req.user?.sub) throw new BadRequestException('User not authenticated');

        const result = await this.tenantsService.createTenant(req.user.sub, name);
        console.log(`[TenantsController] Created tenant:`, result);
        return result;
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async listMe(@Request() req: any) {
        if (!req.user?.sub) throw new BadRequestException('User not authenticated');
        return this.tenantsService.getUserTenants(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post('me/active-tenant')
    async switchTenant(@Body('tenantId') tenantId: string, @Request() req: any, @Res() res: Response) {
        if (!req.user?.sub) throw new BadRequestException('User not authenticated');

        const { accessToken, refreshToken } = await this.tenantsService.switchTenant(req.user.sub, tenantId);

        this.authService.setCookies(res, accessToken, refreshToken);

        return res.json({ message: 'Context switched' });
    }

    @UseGuards(AuthGuard)
    @Get('me/members')
    async listMembers(@Request() req: any) {
        const tenantId = req.user?.tenant_id; // Setup in AuthGuard/Strategy from JWT payload
        if (!tenantId) throw new BadRequestException('No active tenant context');
        return this.tenantsService.getTenantMembers(tenantId, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('me/invites')
    async listInvites(@Request() req: any) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) throw new BadRequestException('No active tenant context');
        return this.tenantsService.listInvites(tenantId, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post('me/invites')
    async createInvite(@Body() body: { email: string; role: string }, @Request() req: any) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) throw new BadRequestException('No active tenant context');
        if (!body.email || !body.role) throw new BadRequestException('Email and role required');
        return this.tenantsService.createInvite(tenantId, req.user.sub, body.email, body.role);
    }

    @UseGuards(AuthGuard)
    @Delete('me/invites/:id')
    async revokeInvite(@Param('id') id: string, @Request() req: any) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) throw new BadRequestException('No active tenant context');
        return this.tenantsService.revokeInvite(tenantId, req.user.sub, id);
    }

    @Get('invites/:token')
    async getInvite(@Param('token') token: string) {
        return this.tenantsService.getInviteByToken(token);
    }

    @UseGuards(AuthGuard)
    @Post('invites/accept')
    async acceptInvite(@Body('token') token: string, @Request() req: any) {
        if (!req.user?.sub) throw new BadRequestException('User not authenticated');
        return this.tenantsService.acceptInvite(req.user.sub, token);
    }

    @UseGuards(AuthGuard)
    @Get('me/plan')
    async getPlan(@Request() req: any) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) throw new BadRequestException('No active tenant context');
        return this.tenantsService.getPlanStatus(tenantId);
    }

    // System/Cron endpoint. In production, protect with specific Cron secret guard.
    // @UseGuards(CronGuard)
    @Post('cron/expire-trials')
    async expireTrials() {
        return this.tenantsService.checkTrialExpiration();
    }

    @Get('lookup/:slug')
    async lookupBySlug(@Param('slug') slug: string) {
        const tenant = await this.tenantsService.lookupBySlug(slug);
        if (!tenant) throw new BadRequestException('Tenant not found');
        return tenant;
    }
    @UseGuards(AuthGuard)
    @Get('current')
    async getCurrent(@Request() req: any) {
        if (!req.user?.tenant_id) return null;
        return this.tenantsService.getTenantById(req.user.tenant_id);
    }
}
