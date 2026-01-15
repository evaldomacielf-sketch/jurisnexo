import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCashBookEntryDto } from './dto/cash-book.dto';

@Injectable()
export class CashBookService {
    private readonly logger = new Logger(CashBookService.name);

    constructor(
        private readonly supabase: SupabaseClient,
    ) { }

    async createEntry(tenantId: string, userId: string, dto: CreateCashBookEntryDto) {
        // 1. Get transaction amount to calculate deductible amount
        const { data: transaction, error: txError } = await this.supabase
            .from('finance_transactions')
            .select('amount')
            .eq('id', dto.transactionId)
            .eq('tenant_id', tenantId)
            .single();

        if (txError) throw new Error(`Transaction not found: ${txError.message}`);

        const deductibleAmount = dto.isDeductible
            ? (transaction.amount * dto.deductiblePercentage) / 100
            : 0;

        // 2. Insert Entry
        const { data, error } = await this.supabase
            .from('finance_cash_book_entries')
            .insert({
                tenant_id: tenantId,
                transaction_id: dto.transactionId,
                fiscal_category: dto.fiscalCategory,
                is_deductible: dto.isDeductible,
                deductible_percentage: dto.deductiblePercentage,
                deductible_amount: deductibleAmount,
                fiscal_competence_date: dto.fiscalCompetenceDate,
                notes: dto.notes,
                proof_url: dto.proofUrl,
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create cash book entry: ${error.message}`);
        }

        return data;
    }

    async findAll(tenantId: string, year: number) {
        // Filter by year on fiscal_competence_date
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await this.supabase
            .from('finance_cash_book_entries')
            .select('*, transaction:transaction_id(*)')
            .eq('tenant_id', tenantId)
            .gte('fiscal_competence_date', startDate)
            .lte('fiscal_competence_date', endDate)
            .order('fiscal_competence_date', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }
}
