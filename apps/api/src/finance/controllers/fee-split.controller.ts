import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { CreateFeeSplitRuleDto, UpdateFeeSplitRuleDto, CreateFeeSplitTransactionDto } from '../dto/fee-split.dto';
import { FeeSplitService } from '../services/fee-split.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
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
    async createRule(@User() user: UserEntity, @Body() dto: CreateFeeSplitRuleDto) {
        return this.service.createRule(user.app_metadata.tenant_id, user.id, dto);
    }

    @Get('rules/:id')
    @ApiOperation({ summary: 'Gets a specific rule' })
    async getRule(@User() user: UserEntity, @Param('id') id: string) {
        return this.service.getRule(user.app_metadata.tenant_id, id);
    }

    @Get('rules')
    @ApiOperation({ summary: 'Lists all rules' })
    async listRules(@User() user: UserEntity, @Query('isActive') isActive?: string) {
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.service.listRules(user.app_metadata.tenant_id, isActiveBool);
    }

    @Put('rules/:id')
    @ApiOperation({ summary: 'Updates a rule' })
    async updateRule(
        @User() user: UserEntity,
        @Param('id') id: string,
        @Body() dto: UpdateFeeSplitRuleDto
    ) {
        return this.service.updateRule(user.app_metadata.tenant_id, user.id, id, dto);
    }

    @Post('transactions')
    @ApiOperation({ summary: 'Creates a split transaction (calculates splits automatically)' })
    async createTransaction(@User() user: UserEntity, @Body() dto: CreateFeeSplitTransactionDto) {
        return this.service.createTransaction(user.app_metadata.tenant_id, user.id, dto);
    }

    @Get('transactions/:id')
    @ApiOperation({ summary: 'Gets a specific transaction' })
    async getTransaction(@User() user: UserEntity, @Param('id') id: string) {
        return this.service.getTransaction(user.app_metadata.tenant_id, id);
    }

    @Post('transactions/:id/approve')
    @ApiOperation({ summary: 'Approves a fee split' })
    async approveTransaction(@User() user: UserEntity, @Param('id') id: string) {
        return this.service.approveTransaction(user.app_metadata.tenant_id, user.id, id);
    }

    @Post('transactions/:id/reject')
    @ApiOperation({ summary: 'Rejects a fee split' })
    async rejectTransaction(
        @User() user: UserEntity,
        @Param('id') id: string,
        @Body('reason') reason: string
    ) {
        return this.service.rejectTransaction(user.app_metadata.tenant_id, user.id, id, reason);
    }

    @Get('extract/:lawyerId')
    @ApiOperation({ summary: 'Generates lawyer extract' })
    async generateExtract(
        @User() user: UserEntity,
        @Param('lawyerId') lawyerId: string,
        @Query('periodStart') periodStart: string,
        @Query('periodEnd') periodEnd: string
    ) {
        return this.service.generateExtract(
            user.app_metadata.tenant_id,
            lawyerId,
            new Date(periodStart),
            new Date(periodEnd)
        );
    }

    @Get('extract/:lawyerId/export')
    @ApiOperation({ summary: 'Exports extract to PDF' })
    async exportExtract(
        @User() user: UserEntity,
        @Param('lawyerId') lawyerId: string,
        @Query('periodStart') periodStart: string,
        @Query('periodEnd') periodEnd: string,
        @Res() res: Response
    ) {
        const fileBuffer = await this.service.exportExtractToPdf(
            user.app_metadata.tenant_id,
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
