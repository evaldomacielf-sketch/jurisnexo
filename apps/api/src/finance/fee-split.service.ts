import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFeeSplitRuleDto } from './dto/fee-split.dto';

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
                split_type: dto.splitType,
                is_automatic: dto.isAutomatic,
                configuration: dto.configuration,
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create split rule: ${error.message}`);
        }

        return data;
    }

    async findAllRules(tenantId: string) {
        const { data, error } = await this.supabase
            .from('finance_fee_split_rules')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) throw new Error(error.message);
        return data;
    }

    async processSplit(tenantId: string, transactionId: string, ruleId: string) {
        // 1. Fetch transaction and rule
        const { data: transaction } = await this.supabase
            .from('finance_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        const { data: rule } = await this.supabase
            .from('finance_fee_split_rules')
            .select('*')
            .eq('id', ruleId)
            .single();

        if (!transaction || !rule) throw new NotFoundException('Transaction or Rule not found');

        // 2. Calculate Splits (Simplistic implementation for now)
        const amount = transaction.amount;
        const splits = [];

        if (rule.split_type === 'percentage') {
            const configSplits = rule.configuration.splits || [];
            for (const split of configSplits) {
                const share = (amount * split.percentage) / 100;
                splits.push({
                    lawyer_id: split.lawyer_id,
                    amount: share,
                    percentage: split.percentage,
                    status: 'pending'
                });
            }
        }

        // 3. Save Split Transaction
        const { data: splitTx, error } = await this.supabase
            .from('finance_fee_split_transactions')
            .insert({
                tenant_id: tenantId,
                rule_id: ruleId,
                origin_transaction_id: transactionId,
                total_amount: amount,
                split_date: new Date().toISOString(),
                status: 'calculated', // Needs approval
                splits: splits
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return splitTx;
    }
}
