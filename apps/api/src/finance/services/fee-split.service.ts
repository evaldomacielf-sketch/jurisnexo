import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFeeSplitRuleDto, UpdateFeeSplitRuleDto, CreateFeeSplitTransactionDto } from '../dto/fee-split.dto';

@Injectable()
export class FeeSplitService {
    private readonly logger = new Logger(FeeSplitService.name);

    constructor(
        private readonly supabase: SupabaseClient,
    ) { }

    async createRule(tenantId: string, userId: string, dto: CreateFeeSplitRuleDto) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_rules')
            .insert({
                tenant_id: tenantId,
                name: dto.name,
                description: dto.description,
                is_automatic: dto.isAutomatic,
                configuration: dto.configuration,
                created_by: userId,
                updated_by: userId,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create split rule: ${error.message}`);
        return data;
    }

    async getRule(tenantId: string, id: string) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_rules')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async listRules(tenantId: string, isActive?: boolean) {
        let query = this.supabase
            .from('finance_fee_split_rules')
            .select('*')
            .eq('tenant_id', tenantId);

        if (isActive !== undefined && isActive !== null) {
            query = query.eq('is_active', isActive);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    }

    async updateRule(tenantId: string, userId: string, id: string, dto: UpdateFeeSplitRuleDto) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_rules')
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

    async createTransaction(tenantId: string, userId: string, dto: CreateFeeSplitTransactionDto) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_transactions')
            .insert({
                tenant_id: tenantId,
                rule_id: dto.ruleId,
                fee_transaction_id: dto.feeTransactionId,
                total_amount: dto.totalAmount,
                split_date: dto.splitDate,
                status: 'pending',
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create split transaction: ${error.message}`);
        return data;
    }

    async getTransaction(tenantId: string, id: string) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_transactions')
            .select('*, rule:rule_id(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async approveTransaction(tenantId: string, userId: string, id: string) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_transactions')
            .update({
                status: 'approved',
                approved_by: userId,
                approved_at: new Date().toISOString(),
            })
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .select()
            .single();

        if (error) return null;
        return data;
    }

    async rejectTransaction(tenantId: string, userId: string, id: string, reason: string) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_transactions')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                rejected_by: userId,
                rejected_at: new Date().toISOString(),
            })
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .select()
            .single();

        if (error) return null;
        return data;
    }

    async generateExtract(tenantId: string, lawyerId: string, periodStart: Date, periodEnd: Date) {
        // Implement extraction logic matching C#
        // Mocking for now as we don't have the full view structure yet
        return {
            lawyerId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            totalAmount: 0,
            transactionCount: 0,
            items: []
        };
    }

    async exportExtractToPdf(tenantId: string, lawyerId: string, periodStart: Date, periodEnd: Date): Promise<Buffer> {
        return Buffer.from('mock-pdf-content');
    }
}
