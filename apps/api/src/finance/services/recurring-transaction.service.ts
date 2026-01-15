import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateRecurringTransactionDto, UpdateRecurringTransactionDto, RecurringTransactionResponseDto } from '../dto/recurring-transaction.dto';

@Injectable()
export class RecurringTransactionService {
    private readonly logger = new Logger(RecurringTransactionService.name);
    private readonly table = 'finance_recurring_transactions';
    private readonly transactionTable = 'finance_transactions';

    constructor(private readonly db: DatabaseService) { }

    async create(
        tenantId: string,
        dto: CreateRecurringTransactionDto,
        userId: string
    ): Promise<RecurringTransactionResponseDto> {
        // Validate Category
        const { data: category } = await this.db.client
            .from('finance_categories')
            .select('id, type')
            .eq('id', dto.category_id)
            .eq('tenant_id', tenantId)
            .single();

        if (!category) {
            throw new BadRequestException('Categoria inválida.');
        }

        if (category.type !== 'BOTH' && category.type !== dto.type) {
            throw new BadRequestException(`Categoria inválida para este tipo de transação.`);
        }

        // Validate Account
        const { data: account } = await this.db.client
            .from('finance_accounts')
            .select('id')
            .eq('id', dto.account_id)
            .eq('tenant_id', tenantId)
            .single();

        if (!account) {
            throw new BadRequestException('Conta bancária inválida.');
        }

        const { data, error } = await this.db.client
            .from(this.table)
            .insert({
                tenant_id: tenantId,
                ...dto,
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating recurring transaction: ${error.message}`, error);
            throw new BadRequestException('Erro ao criar recorrência.');
        }

        await this.logAudit(tenantId, 'CREATE', data.id, userId, null, data);

        return data;
    }

    async findAll(tenantId: string, isActive?: boolean): Promise<RecurringTransactionResponseDto[]> {
        let query = this.db.client
            .from(this.table)
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (isActive !== undefined) {
            query = query.eq('is_active', isActive);
        }

        const { data, error } = await query;

        if (error) {
            this.logger.error(`Error fetching recurring transactions: ${error.message}`);
            throw new BadRequestException('Erro ao listar recorrências.');
        }

        return data || [];
    }

    async findOne(tenantId: string, id: string): Promise<RecurringTransactionResponseDto> {
        const { data, error } = await this.db.client
            .from(this.table)
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Recorrência não encontrada.');
        }

        return data;
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateRecurringTransactionDto,
        userId: string
    ): Promise<RecurringTransactionResponseDto> {
        const existing = await this.findOne(tenantId, id);

        const { data, error } = await this.db.client
            .from(this.table)
            .update(dto)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error updating recurring transaction: ${error.message}`);
            throw new BadRequestException('Erro ao atualizar recorrência.');
        }

        await this.logAudit(tenantId, 'UPDATE', id, userId, existing, data);
        return data;
    }

    async remove(tenantId: string, id: string, userId: string): Promise<void> {
        const existing = await this.findOne(tenantId, id);

        const { error } = await this.db.client
            .from(this.table)
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) {
            this.logger.error(`Error deleting recurring transaction: ${error.message}`);
            throw new BadRequestException('Erro ao excluir recorrência.');
        }

        await this.logAudit(tenantId, 'DELETE', id, userId, existing, null);
    }

    // Helper: Audit Log
    private async logAudit(
        tenantId: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL',
        entityId: string,
        userId: string,
        oldValue?: any,
        newValue?: any
    ) {
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'RECURRING_TRANSACTION',
            entity_id: entityId,
            action,
            actor_id: userId,
            old_value: oldValue,
            new_value: newValue,
        });
    }
}
