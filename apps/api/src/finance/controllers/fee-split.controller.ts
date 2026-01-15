import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { CreateFeeSplitRuleDto, UpdateFeeSplitRuleDto, CreateFeeSplitTransactionDto } from '../dto/fee-split.dto';
import { FeeSplitService } from '../services/fee-split.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../auth/decorators/current-tenant.decorator';
import { User as UserEntity } from '@supabase/supabase-js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Finance - Fee Split')
@Controller('finance/fee-split')
@UseGuards(JwtAuthGuard)
export class FeeSplitController {
    constructor(private readonly service: FeeSplitService) { }

    @Post('rules')
    @ApiOperation({ summary: 'Creates a new fee split rule' })
    async createRule(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Body() dto: CreateFeeSplitRuleDto) {
        return this.service.createRule(tenantId, user.id, dto);
    }

    @Get('rules/:id')
    @ApiOperation({ summary: 'Gets a specific rule' })
    async getRule(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.service.getRule(tenantId, id);
    }

    @Get('rules')
    @ApiOperation({ summary: 'Lists all rules' })
    async listRules(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.service.listRules(tenantId, isActiveBool);
    }

    @Put('rules/:id')
    @ApiOperation({ summary: 'Updates a rule' })
    async updateRule(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateFeeSplitRuleDto
    ) {
        return this.service.updateRule(tenantId, user.id, id, dto);
    }

    @Post('transactions')
    @ApiOperation({ summary: 'Creates a split transaction (calculates splits automatically)' })
    async createTransaction(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Body() dto: CreateFeeSplitTransactionDto) {
        return this.service.createTransaction(tenantId, user.id, dto);
    }

    @Get('transactions/:id')
    @ApiOperation({ summary: 'Gets a specific transaction' })
    async getTransaction(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.service.getTransaction(tenantId, id);
    }

    @Post('transactions/:id/approve')
    @ApiOperation({ summary: 'Approves a fee split' })
    async approveTransaction(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.service.approveTransaction(tenantId, user.id, id);
    }

    @Post('transactions/:id/reject')
    @ApiOperation({ summary: 'Rejects a fee split' })
    async rejectTransaction(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body('reason') reason: string
    ) {
        return this.service.rejectTransaction(tenantId, user.id, id, reason);
    }

    @Get('extract/:lawyerId')
    @ApiOperation({ summary: 'Generates lawyer extract' })
    async generateExtract(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('lawyerId') lawyerId: string,
        @Query('periodStart') periodStart: string,
        @Query('periodEnd') periodEnd: string
    ) {
        return this.service.generateExtract(
            tenantId,
            lawyerId,
            new Date(periodStart),
            new Date(periodEnd)
        );
    }

    @Get('extract/:lawyerId/export')
    @ApiOperation({ summary: 'Exports extract to PDF' })
    async exportExtract(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('lawyerId') lawyerId: string,
        @Query('periodStart') periodStart: string,
        @Query('periodEnd') periodEnd: string,
        @Res() res: Response
    ) {
        const fileBuffer = await this.service.exportExtractToPdf(
            tenantId,
            lawyerId,
            new Date(periodStart),
            new Date(periodEnd)
        );

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="extrato-honorarios-${lawyerId}.pdf"`,
            'Content-Length': fileBuffer.length,
        });

        res.end(fileBuffer);
    }
}
