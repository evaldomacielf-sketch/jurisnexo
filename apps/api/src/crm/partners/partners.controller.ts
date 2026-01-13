import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { AuthGuard } from '../../auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Partners')
@Controller('crm/partners')
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) { }

    @UseGuards(AuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new partner' })
    async createPartner(@Request() req: any, @Body() body: { name: string; phone: string; email: string; areas: string[] }) {
        return this.partnersService.createPartner(req.user.tenantId, body);
    }

    @UseGuards(AuthGuard)
    @Get()
    @ApiOperation({ summary: 'List all partners' })
    async listPartners(@Request() req: any) {
        return this.partnersService.listPartners(req.user.tenantId);
    }
}
