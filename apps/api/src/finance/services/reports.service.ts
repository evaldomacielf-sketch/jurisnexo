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
}
