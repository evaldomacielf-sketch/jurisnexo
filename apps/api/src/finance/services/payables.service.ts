import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePayableDto, ApprovePayableDto, FinanceQueryDto, PaymentStatus, ApprovalStatus } from '../dto';

@Injectable()
export class PayablesService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Create a new payable (conta a pagar)
     */
    async create(tenantId: string, dto: CreatePayableDto, userId: string) {
        const { data: payable, error } = await this.db.client
            .from('finance_payables')
            .insert({
                tenant_id: tenantId,
                supplier_name: dto.supplier_name,
                supplier_document: dto.supplier_document,
                description: dto.description,
                amount: dto.amount,
                due_date: dto.due_date,
                payment_method: dto.payment_method,
                category_id: dto.category_id,
                account_id: dto.account_id,
                notes: dto.notes,
                status: PaymentStatus.PENDING,
                approval_status: ApprovalStatus.PENDING,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'PAYABLE',
            entity_id: payable.id,
            action: 'CREATE',
            actor_id: userId,
            new_value: payable,
        });

        return payable;
    }

    /**
     * List payables with filters and pagination
     */
    async findAll(tenantId: string, query: FinanceQueryDto & { approval_status?: ApprovalStatus }) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;

        let queryBuilder = this.db.client
            .from('finance_payables')
            .select('*, category:finance_categories(id, name, color), account:finance_accounts(id, name, bank_name)', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('due_date', { ascending: true })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (query.status) {
            queryBuilder = queryBuilder.eq('status', query.status);
        }
        if (query.approval_status) {
            queryBuilder = queryBuilder.eq('approval_status', query.approval_status);
        }
        if (query.due_date_from) {
            queryBuilder = queryBuilder.gte('due_date', query.due_date_from);
        }
        if (query.due_date_to) {
            queryBuilder = queryBuilder.lte('due_date', query.due_date_to);
        }
        if (query.category_id) {
            queryBuilder = queryBuilder.eq('category_id', query.category_id);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw new BadRequestException(error.message);

        return {
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    /**
     * Get a single payable by ID
     */
    async findOne(tenantId: string, id: string) {
        const { data, error } = await this.db.client
            .from('finance_payables')
            .select('*, category:finance_categories(id, name, color), account:finance_accounts(id, name, bank_name)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException('Payable not found');
        return data;
    }

    /**
     * Approve or reject a payable
     */
    async approve(tenantId: string, id: string, dto: ApprovePayableDto, userId: string) {
        const { data: payable, error: fetchError } = await this.db.client
            .from('finance_payables')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (fetchError || !payable) throw new NotFoundException('Payable not found');

        if (payable.approval_status !== ApprovalStatus.PENDING) {
            throw new BadRequestException('Payable has already been processed');
        }

        // Check if rejection requires reason
        if (dto.status === ApprovalStatus.REJECTED && !dto.rejection_reason) {
            throw new BadRequestException('Rejection reason is required');
        }

        const { data: updated, error: updateError } = await this.db.client
            .from('finance_payables')
            .update({
                approval_status: dto.status,
                approved_by: userId,
                approved_at: new Date().toISOString(),
                rejection_reason: dto.rejection_reason,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new BadRequestException(updateError.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'PAYABLE',
            entity_id: id,
            action: dto.status === ApprovalStatus.APPROVED ? 'APPROVE' : 'REJECT',
            actor_id: userId,
            old_value: { approval_status: payable.approval_status },
            new_value: { approval_status: dto.status, rejection_reason: dto.rejection_reason },
        });

        return updated;
    }

    /**
     * Mark a payable as paid
     */
    async markAsPaid(tenantId: string, id: string, userId: string, paymentDate?: string) {
        const { data: payable, error: fetchError } = await this.db.client
            .from('finance_payables')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (fetchError || !payable) throw new NotFoundException('Payable not found');

        if (payable.approval_status !== ApprovalStatus.APPROVED) {
            throw new ForbiddenException('Payable must be approved before payment');
        }

        const { data: updated, error: updateError } = await this.db.client
            .from('finance_payables')
            .update({
                status: PaymentStatus.PAID,
                paid_amount: payable.amount,
                payment_date: paymentDate || new Date().toISOString().split('T')[0],
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new BadRequestException(updateError.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'PAYABLE',
            entity_id: id,
            action: 'PAYMENT',
            actor_id: userId,
            old_value: { status: payable.status },
            new_value: { status: PaymentStatus.PAID, paid_amount: payable.amount },
        });

        return updated;
    }

    /**
     * Get pending approvals count
     */
    async getPendingApprovalsCount(tenantId: string) {
        const { count, error } = await this.db.client
            .from('finance_payables')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('approval_status', ApprovalStatus.PENDING);

        if (error) throw new BadRequestException(error.message);
        return count || 0;
    }
}
