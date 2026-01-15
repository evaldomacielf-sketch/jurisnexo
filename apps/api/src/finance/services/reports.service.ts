import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface MonthlySummary {
    total_income: number;
    total_expenses: number;
    balance: number;
    transaction_count: number;
}

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(private readonly db: DatabaseService) { }

    async getMonthlySummary(
        tenantId: string,
        year: number,
        month: number
    ): Promise<MonthlySummary> {
        // Query the materialized view for pre-calculated stats
        const { data, error } = await this.db.client
            .from('finance_mv_monthly_summary')
            .select('total_income, total_expenses, balance, transaction_count')
            .eq('tenant_id', tenantId)
            .eq('year', year)
            .eq('month', month)
            .maybeSingle();

        if (error) {
            this.logger.error(`Error querying monthly summary view: ${error.message}`);
            throw new BadRequestException('Erro ao buscar resumo mensal.');
        }

        // Return found data or zeros if no summary exists for this month
        return data || {
            total_income: 0,
            total_expenses: 0,
            balance: 0,
            transaction_count: 0
        };
    }

    async getDashboardKpis(tenantId: string) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Reuse monthly summary for current month kpis
        const summary = await this.getMonthlySummary(tenantId, year, month);

        return {
            total_receivables: 0, // Placeholder
            total_received: summary.total_income,
            total_overdue: 0, // Placeholder
            total_payables: 0, // Placeholder
            total_paid: summary.total_expenses,
            cash_flow_balance: summary.balance,
            overdue_count: 0, // Placeholder
            pending_approval_count: 0, // Placeholder
        };
    }

    async getCashFlowProjection(tenantId: string, days: number = 30) {
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        // Simple query for transactions in future
        const { data, error } = await this.db.client
            .from('finance_transactions')
            .select('transaction_date, amount, type')
            .eq('tenant_id', tenantId)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate);

        if (error) throw new BadRequestException(error.message);

        // Map to projection format
        const projection = (data || []).map(t => ({
            date: t.transaction_date,
            inflows: t.type === 'INCOME' ? t.amount : 0,
            outflows: t.type === 'EXPENSE' ? t.amount : 0,
            balance: t.type === 'INCOME' ? t.amount : -t.amount
        }));

        return { projection };
    }

    async getAgingReport(tenantId: string, type: 'receivables' | 'payables') {
        const table = type === 'receivables' ? 'finance_receivables' : 'finance_payables';

        const { data, error } = await this.db.client
            .from(table)
            .select('amount, due_date')
            .eq('tenant_id', tenantId)
            .eq('status', 'pending'); // Assuming 'pending' status indicates open item

        if (error) throw new BadRequestException(error.message);

        // Simple bucket logic
        const buckets = {
            '1-30': 0,
            '31-60': 0,
            '61-90': 0,
            '90+': 0
        };

        const now = new Date();
        (data || []).forEach(item => {
            const dueDate = new Date(item.due_date);
            const diffDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 30) buckets['1-30'] += item.amount;
            else if (diffDays <= 60) buckets['31-60'] += item.amount;
            else if (diffDays <= 90) buckets['61-90'] += item.amount;
            else buckets['90+'] += item.amount;
        });

        return { buckets };
    }
}
