import { Controller, Post, Body, Get, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
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
        // For now mocking user ID from request until Guard implemented.
        // In real flow: req.user.sub
        if (!req.user?.sub) throw new BadRequestException('User not authenticated');

        return this.tenantsService.createTenant(req.user.sub, name);
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
}
