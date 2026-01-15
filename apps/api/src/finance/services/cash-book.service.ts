import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCashBookEntryDto, UpdateCashBookEntryDto, CashBookReportDto } from '../dto/cash-book.dto';

@Injectable()
export class CashBookService {
    private readonly logger = new Logger(CashBookService.name);

    constructor(
        private readonly supabase: SupabaseClient,
    ) { }

    async createEntry(tenantId: string, userId: string, dto: CreateCashBookEntryDto) {
        const { data, error } = await this.supabase
            .from('finance_cash_book_entries')
            .insert({
                tenant_id: tenantId,
                transaction_id: dto.transactionId,
                fiscal_category: dto.fiscalCategory,
                is_deductible: dto.isDeductible,
                deductible_percentage: dto.deductiblePercentage,
                fiscal_competence_date: dto.fiscalCompetenceDate,
                notes: dto.notes,
                proof_url: dto.proofUrl,
                created_by: userId,
                updated_by: userId,
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating cash book entry: ${error.message}`);
            throw new Error(`Failed to create cash book entry: ${error.message}`);
        }

        return data;
    }

    async getEntry(tenantId: string, id: string) {
        const { data, error } = await this.supabase
            .from('finance_cash_book_entries')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async listEntries(tenantId: string, year: number, month?: number, fiscalCategory?: string, isDeductible?: boolean) {
        let query = this.supabase
            .from('finance_cash_book_entries')
            .select('*, transaction:transaction_id(*)')
            .eq('tenant_id', tenantId);

        // Filter by date range (year/month) based on fiscal_competence_date
        const startDate = new Date(year, (month || 1) - 1, 1).toISOString();
        let endDate: string;

        if (month) {
            endDate = new Date(year, month, 0).toISOString(); // Last day of month
        } else {
            endDate = new Date(year, 11, 31).toISOString(); // Last day of year
        }

        query = query
            .gte('fiscal_competence_date', startDate)
            .lte('fiscal_competence_date', endDate);

        if (fiscalCategory) query = query.eq('fiscal_category', fiscalCategory);
        if (isDeductible !== undefined && isDeductible !== null) query = query.eq('is_deductible', isDeductible);

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to list entries: ${error.message}`);
        }

        return data;
    }

    async updateEntry(tenantId: string, userId: string, id: string, dto: UpdateCashBookEntryDto) {
        const { data, error } = await this.supabase
            .from('finance_cash_book_entries')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            })
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .select()
            .single();

        if (error) return null;
        return data;
    }

    async generateAnnualReport(tenantId: string, year: number): Promise<CashBookReportDto> {
        // This would typically involve a stored procedure or complex query
        // For MVP, we'll mock or call a Supabase RPC function if it existed
        // Let's assume an RPC function 'get_cash_book_report' exists or we implement logic

        const { data, error } = await this.supabase
            .rpc('get_cash_book_report', {
                p_tenant_id: tenantId,
                p_year: year
            });

        if (error) {
            // Fallback or throw
            this.logger.warn(`RPC get_cash_book_report failed: ${error.message}. Returning empty structure.`);
            return {
                year,
                totalIncome: 0,
                totalExpenses: 0,
                totalDeductibleExpenses: 0,
                netIncome: 0,
                incomeByCategory: [],
                expensesByCategory: [],
                monthlyBreakdown: []
            };
        }

        return data as CashBookReportDto;
    }

    async exportToExcel(tenantId: string, year: number, format: 'xlsx' | 'csv'): Promise<Buffer> {
        // Mock implementation for file generation
        // in a real app, use 'exceljs' or similar
        return Buffer.from('mock-excel-file-content');
    }

    async getFiscalCategories() {
        return [
            'Aluguel',
            'Condomínio',
            'Energia',
            'Internet',
            'Material de Escritório',
            'Honorários',
            'Outros'
        ];
    }
}
