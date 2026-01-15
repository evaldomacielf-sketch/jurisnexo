import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { FeeSplitService } from './fee-split.service';
import { CreateFeeSplitRuleDto } from './dto/fee-split.dto';

@ApiTags('Fee Splits')
@Controller('finance/fee-splits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeeSplitController {
    constructor(private readonly feeSplitService: FeeSplitService) { }

    @Post('rules')
    @ApiOperation({ summary: 'Create a fee split rule' })
    createRule(@Request() req, @Body() dto: CreateFeeSplitRuleDto) {
        return this.feeSplitService.createRule(req.user.tenantId, req.user.id, dto);
    }

    @Get('rules')
    @ApiOperation({ summary: 'List fee split rules' })
    findAllRules(@Request() req) {
        return this.feeSplitService.findAllRules(req.user.tenantId);
    }

    @Post('calculate/:transactionId/:ruleId')
    @ApiOperation({ summary: 'Calculate split for a transaction' })
    processSplit(
        @Request() req,
        @Param('transactionId') transactionId: string,
        @Param('ruleId') ruleId: string,
    ) {
        return this.feeSplitService.processSplit(req.user.tenantId, transactionId, ruleId);
    }
}
