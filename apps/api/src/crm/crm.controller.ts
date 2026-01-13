import { Controller, Get, Post, Body, Param, Request, Query, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AuthGuard } from '../auth.guard'; // Assuming AuthGuard exists in parent
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('CRM')
@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @UseGuards(AuthGuard)
    @Get('conversations')
    @ApiOperation({ summary: 'List conversations' })
    async getConversations(@Request() req: any, @Query() query: any) {
        return this.crmService.getConversations(req.user.tenantId, query);
    }

    @UseGuards(AuthGuard)
    @Get('conversations/:id')
    @ApiOperation({ summary: 'Get conversation details' })
    async getConversation(@Request() req: any, @Param('id') id: string) {
        return this.crmService.getConversation(req.user.tenantId, id);
    }

    @UseGuards(AuthGuard)
    @Post('conversations/:id/messages')
    @ApiOperation({ summary: 'Send a message' })
    async sendMessage(@Request() req: any, @Param('id') id: string, @Body('content') content: string) {
        return this.crmService.sendMessage(req.user.tenantId, id, content, req.user.id);
    }

    // Webhook for Inbound Messages (Public or Protected via API Key)
    // For simplicity, we assume a simulated open endpoint or basic auth handled elsewhere
    @Post('inbound')
    @ApiOperation({ summary: 'Handle inbound message webhook' })
    async handleInbound(@Body() body: any) {
        // Body: { from: string, content: string, providerId: string, tenantId: string }
        // In real scenario, tenantId comes from the webhook config or headers
        return this.crmService.handleInbound(body.tenantId, body.from, body.content, body.providerId);
    }
    @Get('kanban')
    @ApiOperation({ summary: 'Get Kanban board data' })
    async getKanban() {
        // Mock: just require authentication, ignore tenant for mock
        // If AuthGuard is fully strict, we neeed a valid user.
        // Assuming req.user exists from AuthGuard.
        return this.crmService.getKanbanData();
    }
}
