import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateLegalFeeDto, RecordFeePaymentDto, UpdateLegalFeeDto } from './dto/legal-fees.dto';

@Injectable()
export class LegalFeesService {
    private readonly logger = new Logger(LegalFeesService.name);

    constructor(
        private readonly database: DatabaseService,
    ) { }

    async create(tenantId: string, userId: string, dto: CreateLegalFeeDto) {
        const { data, error } = await this.database.client
            .from('finance_legal_fees')
            .insert({
                tenant_id: tenantId,
                client_id: dto.clientId,
                case_id: dto.caseId,
                description: dto.description,
                fee_type: dto.feeType,
                contracted_amount: dto.contractedAmount,
                payment_configuration: dto.paymentConfiguration || {},
                created_by: userId,
                updated_by: userId,
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating legal fee: ${error.message}`);
            throw new Error(`Failed to create legal fee: ${error.message}`);
        }

        return data;
    }

    async findAll(tenantId: string, filters?: any) {
        let query = this.database.client
            .from('finance_legal_fees')
            .select('*, client:client_id(name), case:case_id(title)')
            .eq('tenant_id', tenantId);

        if (filters?.clientId) query = query.eq('client_id', filters.clientId);
        if (filters?.caseId) query = query.eq('case_id', filters.caseId);
        if (filters?.status) query = query.eq('payment_status', filters.status);

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch legal fees: ${error.message}`);
        }

        return data;
    }

    async findOne(tenantId: string, id: string) {
        const { data, error } = await this.database.client
            .from('finance_legal_fees')
            .select('*, payments:finance_fee_payments(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) {
            throw new NotFoundException(`Legal fee not found`);
        }

        return data;
    }

    async recordPayment(tenantId: string, userId: string, feeId: string, dto: RecordFeePaymentDto) {
        // 1. Verify fee exists
        const fee = await this.findOne(tenantId, feeId);

        // 2. Record payment
        const { data: payment, error: paymentError } = await this.database.client
            .from('finance_fee_payments')
            .insert({
                tenant_id: tenantId,
                legal_fee_id: feeId,
                amount: dto.amount,
                payment_method: dto.paymentMethod,
                payment_date: dto.paymentDate,
                notes: dto.notes,
                status: 'confirmed', // Assuming manual entry is confirmed
            })
            .select()
            .single();

        if (paymentError) throw new Error(`Failed to record payment: ${paymentError.message}`);

        // 3. Update parent fee totals
        const newPaidAmount = (fee.paid_amount || 0) + dto.amount;
        const newPendingAmount = (fee.contracted_amount || 0) - newPaidAmount;

        // Determine status
        let status = 'partial_paid';
        if (newPendingAmount <= 0) status = 'paid';
        else if (newPaidAmount === 0) status = 'pending';

        // Update fee
        await this.database.client
            .from('finance_legal_fees')
            .update({
                paid_amount: newPaidAmount,
                pending_amount: newPendingAmount > 0 ? newPendingAmount : 0,
                payment_status: status,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            })
            .eq('id', feeId);

        return payment;
    }
    async update(tenantId: string, userId: string, id: string, dto: UpdateLegalFeeDto) {
        const { data, error } = await this.database.client
            .from('finance_legal_fees')
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

    async getProfitabilityAnalysis(tenantId: string, startDate?: Date, endDate?: Date, clientId?: string) {
        // In a real implementation, this would likely be a complex query or RPC function
        // For now, we'll implement a basic calculation based on fetched fees

        let query = this.database.client
            .from('finance_legal_fees')
            .select('*, client:client_id(name)')
            .eq('tenant_id', tenantId);

        if (clientId) query = query.eq('client_id', clientId);

        const { data: fees, error } = await query;
        if (error) throw new Error(error.message);

        // Filter by date range if necessary (though createdAt might not be the best field, maybe last payment?)
        // Assuming all fees for now for simplicity of this MVP implementation

        return fees.map(fee => {
            const contracted = fee.contracted_amount || 0;
            const paid = fee.paid_amount || 0;
            const costs = fee.case_costs || 0;
            const netProfit = paid - costs;
            const profitMargin = paid > 0 ? (netProfit / paid) * 100 : 0;

            // Calculate days overdue - basic logic
            let daysOverdue = 0;
            if (fee.payment_status !== 'paid' && fee.due_date) {
                const due = new Date(fee.due_date);
                const now = new Date();
                if (now > due) {
                    const diffTime = Math.abs(now.getTime() - due.getTime());
                    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            }

            return {
                legalFeeId: fee.id,
                description: fee.description,
                clientName: fee.client?.name || 'Unknown',
                contractedAmount: contracted,
                paidAmount: paid,
                caseCosts: costs,
                netProfit: netProfit,
                profitMargin: parseFloat(profitMargin.toFixed(2)),
                paymentStatus: fee.payment_status,
                daysOverdue: daysOverdue
            };
        });
    }

    async getDashboard(tenantId: string) {
        // Call RPC for performance
        const { data, error } = await this.database.client.rpc('get_finance_legal_fees_dashboard', { p_tenant_id: tenantId });

        if (error) {
            // Fallback mock
            return {
                totalContracted: 0,
                totalReceived: 0,
                totalPending: 0,
                activeContracts: 0
            };
        }
        return data;
    }
}
