import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { DashboardKpisDto, PaymentStatus, ApprovalStatus } from '../dto';

@Injectable()
export class ReportsService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Get dashboard KPIs
     */
    async getDashboardKpis(tenantId: string): Promise<DashboardKpisDto> {
        const today = new Date().toISOString().split('T')[0];

        // Get receivables totals
        const { data: receivables, error: recError } = await this.db.client
            .from('finance_receivables')
            .select('amount, paid_amount, status')
            .eq('tenant_id', tenantId)
            .neq('status', PaymentStatus.CANCELLED);

        if (recError) throw new BadRequestException(recError.message);

        // Get payables totals
        const { data: payables, error: payError } = await this.db.client
            .from('finance_payables')
            .select('amount, paid_amount, status, approval_status')
            .eq('tenant_id', tenantId)
            .neq('status', PaymentStatus.CANCELLED);

        if (payError) throw new BadRequestException(payError.message);

        // Calculate KPIs
        const totalReceivables = receivables?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
        const totalReceived = receivables?.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0) || 0;
        const totalOverdue = receivables
            ?.filter(r => r.status === PaymentStatus.OVERDUE)
            .reduce((sum, r) => sum + (Number(r.amount) - Number(r.paid_amount || 0)), 0) || 0;
        const overdueCount = receivables?.filter(r => r.status === PaymentStatus.OVERDUE).length || 0;

        const totalPayables = payables?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const totalPaid = payables?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
        const pendingApprovalCount = payables?.filter(p => p.approval_status === ApprovalStatus.PENDING).length || 0;

        // Cash flow balance (received - paid)
        const cashFlowBalance = totalReceived - totalPaid;

        return {
            total_receivables: totalReceivables,
            total_received: totalReceived,
            total_overdue: totalOverdue,
            total_payables: totalPayables,
            total_paid: totalPaid,
            cash_flow_balance: cashFlowBalance,
            overdue_count: overdueCount,
            pending_approval_count: pendingApprovalCount,
        };
    }

    /**
     * Get cash flow projection for the next N days
     */
    async getCashFlowProjection(tenantId: string, days: number = 30) {
        const today = new Date();
        const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const todayStr = today.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Get pending receivables in period
        const { data: receivables, error: recError } = await this.db.client
            .from('finance_receivables')
            .select('due_date, amount, paid_amount')
            .eq('tenant_id', tenantId)
            .in('status', [PaymentStatus.PENDING, PaymentStatus.PARTIAL])
            .gte('due_date', todayStr)
            .lte('due_date', endDateStr)
            .order('due_date', { ascending: true });

        if (recError) throw new BadRequestException(recError.message);

        // Get pending payables in period
        const { data: payables, error: payError } = await this.db.client
            .from('finance_payables')
            .select('due_date, amount, paid_amount')
            .eq('tenant_id', tenantId)
            .eq('approval_status', ApprovalStatus.APPROVED)
            .in('status', [PaymentStatus.PENDING, PaymentStatus.PARTIAL])
            .gte('due_date', todayStr)
            .lte('due_date', endDateStr)
            .order('due_date', { ascending: true });

        if (payError) throw new BadRequestException(payError.message);

        // Group by date
        const projectionMap = new Map<string, { date: string; inflows: number; outflows: number; balance: number }>();

        // Add receivables (inflows)
        receivables?.forEach(r => {
            const remaining = Number(r.amount) - Number(r.paid_amount || 0);
            const existing = projectionMap.get(r.due_date) || { date: r.due_date, inflows: 0, outflows: 0, balance: 0 };
            existing.inflows += remaining;
            projectionMap.set(r.due_date, existing);
        });

        // Add payables (outflows)
        payables?.forEach(p => {
            const remaining = Number(p.amount) - Number(p.paid_amount || 0);
            const existing = projectionMap.get(p.due_date) || { date: p.due_date, inflows: 0, outflows: 0, balance: 0 };
            existing.outflows += remaining;
            projectionMap.set(p.due_date, existing);
        });

        // Calculate running balance
        const projection = Array.from(projectionMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        let runningBalance = 0;
        projection.forEach(p => {
            runningBalance += p.inflows - p.outflows;
            p.balance = runningBalance;
        });

        return {
            period: { start: todayStr, end: endDateStr },
            projection,
            summary: {
                total_inflows: projection.reduce((sum, p) => sum + p.inflows, 0),
                total_outflows: projection.reduce((sum, p) => sum + p.outflows, 0),
                projected_balance: runningBalance,
            },
        };
    }

    /**
     * Get aging report (contas por vencimento)
     */
    async getAgingReport(tenantId: string, type: 'receivables' | 'payables') {
        const today = new Date();
        const table = type === 'receivables' ? 'finance_receivables' : 'finance_payables';

        const { data, error } = await this.db.client
            .from(table)
            .select('due_date, amount, paid_amount, status')
            .eq('tenant_id', tenantId)
            .in('status', [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE]);

        if (error) throw new BadRequestException(error.message);

        // Categorize by aging buckets
        const buckets = {
            current: 0,      // Not yet due
            '1-30': 0,       // 1-30 days overdue
            '31-60': 0,      // 31-60 days overdue
            '61-90': 0,      // 61-90 days overdue
            '90+': 0,        // 90+ days overdue
        };

        data?.forEach(item => {
            const dueDate = new Date(item.due_date);
            const remaining = Number(item.amount) - Number(item.paid_amount || 0);
            const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 0) {
                buckets.current += remaining;
            } else if (daysDiff <= 30) {
                buckets['1-30'] += remaining;
            } else if (daysDiff <= 60) {
                buckets['31-60'] += remaining;
            } else if (daysDiff <= 90) {
                buckets['61-90'] += remaining;
            } else {
                buckets['90+'] += remaining;
            }
        });

        return {
            type,
            buckets,
            total: Object.values(buckets).reduce((sum, val) => sum + val, 0),
        };
    }

    /**
     * Get monthly summary (DRE simplificado)
     */
    async getMonthlySummary(tenantId: string, year: number, month: number) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

        // Get received amounts
        const { data: received, error: recError } = await this.db.client
            .from('finance_receivables')
            .select('paid_amount, category_id, category:finance_categories(name)')
            .eq('tenant_id', tenantId)
            .eq('status', PaymentStatus.PAID)
            .gte('payment_date', startDate)
            .lte('payment_date', endDate);

        if (recError) throw new BadRequestException(recError.message);

        // Get paid amounts
        const { data: paid, error: payError } = await this.db.client
            .from('finance_payables')
            .select('paid_amount, category_id, category:finance_categories(name)')
            .eq('tenant_id', tenantId)
            .eq('status', PaymentStatus.PAID)
            .gte('payment_date', startDate)
            .lte('payment_date', endDate);

        if (payError) throw new BadRequestException(payError.message);

        const totalReceived = received?.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0) || 0;
        const totalPaid = paid?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;

        return {
            period: { year, month },
            revenue: totalReceived,
            expenses: totalPaid,
            profit: totalReceived - totalPaid,
            margin: totalReceived > 0 ? ((totalReceived - totalPaid) / totalReceived * 100).toFixed(2) : 0,
        };
    }
}
