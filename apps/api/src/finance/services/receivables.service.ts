import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateReceivableDto, RecordPaymentDto, FinanceQueryDto, PaymentStatus } from '../dto';

@Injectable()
export class ReceivablesService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Create a new receivable (conta a receber)
     */
    async create(tenantId: string, dto: CreateReceivableDto, userId: string) {
        const { data: receivable, error } = await this.db.client
            .from('finance_receivables')
            .insert({
                tenant_id: tenantId,
                client_id: dto.client_id,
                client_name: dto.client_name,
                client_document: dto.client_document,
                case_id: dto.case_id,
                description: dto.description,
                amount: dto.amount,
                due_date: dto.due_date,
                payment_method: dto.payment_method,
                category_id: dto.category_id,
                recurrence_type: dto.recurrence_type || 'ONCE',
                notes: dto.notes,
                status: PaymentStatus.PENDING,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'RECEIVABLE',
            entity_id: receivable.id,
            action: 'CREATE',
            actor_id: userId,
            new_value: receivable,
        });

        return receivable;
    }

    /**
     * List receivables with filters and pagination
     */
    async findAll(tenantId: string, query: FinanceQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;

        let queryBuilder = this.db.client
            .from('finance_receivables')
            .select('*, category:finance_categories(id, name, color)', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('due_date', { ascending: true })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (query.status) {
            queryBuilder = queryBuilder.eq('status', query.status);
        }
        if (query.due_date_from) {
            queryBuilder = queryBuilder.gte('due_date', query.due_date_from);
        }
        if (query.due_date_to) {
            queryBuilder = queryBuilder.lte('due_date', query.due_date_to);
        }
        if (query.client_id) {
            queryBuilder = queryBuilder.eq('client_id', query.client_id);
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
     * Get a single receivable by ID
     */
    async findOne(tenantId: string, id: string) {
        const { data, error } = await this.db.client
            .from('finance_receivables')
            .select('*, category:finance_categories(id, name, color), invoice:finance_invoices(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException('Receivable not found');
        return data;
    }

    /**
     * Record a payment on a receivable
     */
    async recordPayment(tenantId: string, id: string, dto: RecordPaymentDto, userId: string) {
        // Get current receivable
        const { data: receivable, error: fetchError } = await this.db.client
            .from('finance_receivables')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (fetchError || !receivable) throw new NotFoundException('Receivable not found');

        // Calculate new paid amount
        const newPaidAmount = (receivable.paid_amount || 0) + dto.amount;
        const remaining = receivable.amount - newPaidAmount;

        // Determine new status
        let newStatus: PaymentStatus;
        if (remaining <= 0) {
            newStatus = PaymentStatus.PAID;
        } else if (newPaidAmount > 0) {
            newStatus = PaymentStatus.PARTIAL;
        } else {
            newStatus = receivable.status;
        }

        // Update receivable
        const { data: updated, error: updateError } = await this.db.client
            .from('finance_receivables')
            .update({
                paid_amount: newPaidAmount,
                status: newStatus,
                payment_date: remaining <= 0 ? (dto.payment_date || new Date().toISOString().split('T')[0]) : null,
                payment_method: dto.payment_method || receivable.payment_method,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new BadRequestException(updateError.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'RECEIVABLE',
            entity_id: id,
            action: 'PAYMENT',
            actor_id: userId,
            old_value: { paid_amount: receivable.paid_amount, status: receivable.status },
            new_value: { paid_amount: newPaidAmount, status: newStatus, payment_amount: dto.amount },
        });

        return updated;
    }

    /**
     * Cancel a receivable
     */
    async cancel(tenantId: string, id: string, userId: string, reason?: string) {
        const { data: receivable, error: fetchError } = await this.db.client
            .from('finance_receivables')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (fetchError || !receivable) throw new NotFoundException('Receivable not found');

        if (receivable.status === PaymentStatus.PAID) {
            throw new BadRequestException('Cannot cancel a paid receivable');
        }

        const { data: updated, error: updateError } = await this.db.client
            .from('finance_receivables')
            .update({ status: PaymentStatus.CANCELLED })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new BadRequestException(updateError.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'RECEIVABLE',
            entity_id: id,
            action: 'CANCEL',
            actor_id: userId,
            old_value: { status: receivable.status },
            new_value: { status: PaymentStatus.CANCELLED, reason },
        });

        return updated;
    }

    /**
     * Update overdue status for receivables past due date
     * This should be called by a scheduled job
     */
    async updateOverdueStatus(tenantId: string) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await this.db.client
            .from('finance_receivables')
            .update({ status: PaymentStatus.OVERDUE })
            .eq('tenant_id', tenantId)
            .eq('status', PaymentStatus.PENDING)
            .lt('due_date', today)
            .select();

        if (error) throw new BadRequestException(error.message);
        return { updated: data?.length || 0 };
    }
}
