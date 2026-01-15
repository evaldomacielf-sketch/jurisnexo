import {
    Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { ReceivablesService } from './services/receivables.service';
import { PayablesService } from './services/payables.service';
import { ReportsService } from './services/reports.service';
import {
    CreateReceivableDto,
    RecordPaymentDto,
    CreatePayableDto,
    ApprovePayableDto,
    FinanceQueryDto,
    DashboardKpisDto,
    ApprovalStatus,
} from './dto';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(AuthGuard)
export class FinanceController {
    constructor(
        private readonly receivablesService: ReceivablesService,
        private readonly payablesService: PayablesService,
        private readonly reportsService: ReportsService,
    ) { }

    // =====================================
    // RECEIVABLES (Contas a Receber)
    // =====================================

    @Post('receivables')
    @ApiOperation({ summary: 'Create a new receivable' })
    @ApiResponse({ status: 201, description: 'Receivable created successfully' })
    async createReceivable(@Request() req: any, @Body() dto: CreateReceivableDto) {
        return this.receivablesService.create(req.user.tenantId, dto, req.user.id);
    }

    @Get('receivables')
    @ApiOperation({ summary: 'List receivables with filters and pagination' })
    async listReceivables(@Request() req: any, @Query() query: FinanceQueryDto) {
        return this.receivablesService.findAll(req.user.tenantId, query);
    }

    @Get('receivables/:id')
    @ApiOperation({ summary: 'Get a single receivable by ID' })
    async getReceivable(@Request() req: any, @Param('id') id: string) {
        return this.receivablesService.findOne(req.user.tenantId, id);
    }

    @Patch('receivables/:id/record-payment')
    @ApiOperation({ summary: 'Record a payment on a receivable' })
    async recordPayment(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: RecordPaymentDto,
    ) {
        return this.receivablesService.recordPayment(req.user.tenantId, id, dto, req.user.id);
    }

    @Patch('receivables/:id/cancel')
    @ApiOperation({ summary: 'Cancel a receivable' })
    async cancelReceivable(
        @Request() req: any,
        @Param('id') id: string,
        @Body('reason') reason?: string,
    ) {
        return this.receivablesService.cancel(req.user.tenantId, id, req.user.id, reason);
    }

    // =====================================
    // PAYABLES (Contas a Pagar)
    // =====================================

    @Post('payables')
    @ApiOperation({ summary: 'Create a new payable' })
    @ApiResponse({ status: 201, description: 'Payable created successfully' })
    async createPayable(@Request() req: any, @Body() dto: CreatePayableDto) {
        return this.payablesService.create(req.user.tenantId, dto, req.user.id);
    }

    @Get('payables')
    @ApiOperation({ summary: 'List payables with filters and pagination' })
    async listPayables(
        @Request() req: any,
        @Query() query: FinanceQueryDto & { approval_status?: ApprovalStatus },
    ) {
        return this.payablesService.findAll(req.user.tenantId, query);
    }

    @Get('payables/:id')
    @ApiOperation({ summary: 'Get a single payable by ID' })
    async getPayable(@Request() req: any, @Param('id') id: string) {
        return this.payablesService.findOne(req.user.tenantId, id);
    }

    @Patch('payables/:id/approve')
    @ApiOperation({ summary: 'Approve or reject a payable' })
    async approvePayable(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: ApprovePayableDto,
    ) {
        return this.payablesService.approve(req.user.tenantId, id, dto, req.user.id);
    }

    @Patch('payables/:id/mark-paid')
    @ApiOperation({ summary: 'Mark a payable as paid' })
    async markPayablePaid(
        @Request() req: any,
        @Param('id') id: string,
        @Body('payment_date') paymentDate?: string,
    ) {
        return this.payablesService.markAsPaid(req.user.tenantId, id, req.user.id, paymentDate);
    }

    // =====================================
    // REPORTS & DASHBOARD
    // =====================================

    @Get('reports/dashboard')
    @ApiOperation({ summary: 'Get dashboard KPIs' })
    @ApiResponse({ status: 200, type: DashboardKpisDto })
    async getDashboardKpis(@Request() req: any): Promise<DashboardKpisDto> {
        return this.reportsService.getDashboardKpis(req.user.tenantId);
    }

    @Get('reports/cash-flow')
    @ApiOperation({ summary: 'Get cash flow projection' })
    async getCashFlow(@Request() req: any, @Query('days') days?: number) {
        return this.reportsService.getCashFlowProjection(req.user.tenantId, days || 30);
    }

    @Get('reports/aging')
    @ApiOperation({ summary: 'Get aging report (contas por vencimento)' })
    async getAgingReport(
        @Request() req: any,
        @Query('type') type: 'receivables' | 'payables' = 'receivables',
    ) {
        return this.reportsService.getAgingReport(req.user.tenantId, type);
    }

    @Get('reports/monthly')
    @ApiOperation({ summary: 'Get monthly summary (DRE simplificado)' })
    async getMonthlySummary(
        @Request() req: any,
        @Query('year') year: number,
        @Query('month') month: number,
    ) {
        const currentDate = new Date();
        const y = year || currentDate.getFullYear();
        const m = month || currentDate.getMonth() + 1;
        return this.reportsService.getMonthlySummary(req.user.tenantId, y, m);
    }
}
