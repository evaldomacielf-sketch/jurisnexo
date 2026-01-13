import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { AuthGuard } from '../auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Superadmin')
@Controller('super')
export class SuperadminController {
    constructor(private readonly superadminService: SuperadminService) { }

    @UseGuards(AuthGuard)
    @Get('tenants')
    @ApiOperation({ summary: 'List all tenants (Superadmin only)' })
    async listTenants(@Request() req: any) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.listTenants();
    }

    @UseGuards(AuthGuard)
    @Get('audit')
    @ApiOperation({ summary: 'Get global audit logs (Superadmin only)' })
    async getAuditLogs(@Request() req: any) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.getGlobalAuditLogs();
    }

    @UseGuards(AuthGuard)
    @Post('tenants/:id/disable')
    @ApiOperation({ summary: 'Disable a tenant' })
    async disableTenant(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
        await this.superadminService.checkIsSuperadmin(req.user.id);
        return this.superadminService.disableTenant(req.user.id, id, reason);
    }
}
