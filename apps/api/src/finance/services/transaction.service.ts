import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionFilterDto,
    TransactionResponseDto,
    TransactionType,
    TransactionStatus,
} from '../dto/transaction.dto';

@Injectable()
export class TransactionService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Cria uma nova transação e atualiza o saldo da conta
     */
    async create(
        tenantId: string,
        dto: CreateTransactionDto,
        userId: string
    ): Promise<TransactionResponseDto> {
        // Valida se a conta bancária existe e pertence ao tenant
        const { data: account } = await this.db.client
            .from('finance_accounts')
            .select('id, current_balance')
            .eq('id', dto.bank_account_id)
            .eq('tenant_id', tenantId)
            .single();

        if (!account) {
            throw new BadRequestException('Conta bancária não encontrada');
        }

        // Valida se a categoria existe e pertence ao tenant
        const { data: category } = await this.db.client
            .from('finance_categories')
            .select('id')
            .eq('id', dto.category_id)
            .eq('tenant_id', tenantId)
            .single();

        if (!category) {
            throw new BadRequestException('Categoria não encontrada');
        }

        // Cria a transação
        const { data: transaction, error } = await this.db.client
            .from('finance_transactions')
            .insert({
                tenant_id: tenantId,
                description: dto.description,
                type: dto.type,
                amount: dto.amount,
                category_id: dto.category_id,
                account_id: dto.bank_account_id,
                transaction_date: dto.transaction_date,
                payment_method: dto.payment_method,
                case_id: dto.case_id,
                client_id: dto.client_id,
                notes: dto.notes,
                document_id: dto.document_id,
                status: TransactionStatus.COMPLETED,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Atualiza o saldo da conta
        await this.updateAccountBalance(
            tenantId,
            dto.bank_account_id,
            dto.amount,
            dto.type
        );

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'TRANSACTION',
            entity_id: transaction.id,
            action: 'CREATE',
            actor_id: userId,
            new_value: transaction,
        });

        return transaction;
    }

    /**
     * Lista transações com filtros
     */
    async findAll(
        tenantId: string,
        filterDto: TransactionFilterDto
    ): Promise<{ data: TransactionResponseDto[]; total: number; page: number; limit: number }> {
        let query = this.db.client
            .from('finance_transactions')
            .select('*, category:finance_categories(id, name, color), account:finance_accounts(id, name)', { count: 'exact' })
            .eq('tenant_id', tenantId);

        // Aplica filtros
        if (filterDto.type) {
            query = query.eq('type', filterDto.type);
        }

        if (filterDto.status) {
            query = query.eq('status', filterDto.status);
        }

        if (filterDto.bank_account_id) {
            query = query.eq('account_id', filterDto.bank_account_id);
        }

        if (filterDto.category_id) {
            query = query.eq('category_id', filterDto.category_id);
        }

        if (filterDto.start_date) {
            query = query.gte('transaction_date', filterDto.start_date);
        }

        if (filterDto.end_date) {
            query = query.lte('transaction_date', filterDto.end_date);
        }

        // Paginação
        const page = filterDto.page || 1;
        const limit = filterDto.limit || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to).order('transaction_date', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw new BadRequestException(error.message);

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Busca uma transação específica
     */
    async findOne(tenantId: string, id: string): Promise<TransactionResponseDto> {
        const { data, error } = await this.db.client
            .from('finance_transactions')
            .select('*, category:finance_categories(id, name, color), account:finance_accounts(id, name)')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Transação não encontrada');
        }

        return data;
    }

    /**
     * Atualiza uma transação
     */
    async update(
        tenantId: string,
        id: string,
        dto: UpdateTransactionDto,
        userId: string
    ): Promise<TransactionResponseDto> {
        const oldTransaction = await this.findOne(tenantId, id);

        // Se o valor ou tipo mudou, reverte o saldo antigo
        if (dto.amount !== undefined || dto.type) {
            await this.updateAccountBalance(
                tenantId,
                oldTransaction.bank_account_id,
                oldTransaction.amount,
                oldTransaction.type === TransactionType.INCOME ? TransactionType.EXPENSE : TransactionType.INCOME
            );
        }

        const { data, error } = await this.db.client
            .from('finance_transactions')
            .update({
                ...dto,
                account_id: dto.bank_account_id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Aplica o novo saldo
        if (dto.amount !== undefined || dto.type) {
            await this.updateAccountBalance(
                tenantId,
                data.account_id,
                data.amount,
                data.type
            );
        }

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'TRANSACTION',
            entity_id: id,
            action: 'UPDATE',
            actor_id: userId,
            old_value: oldTransaction,
            new_value: data,
        });

        return data;
    }

    /**
     * Remove uma transação
     */
    async remove(tenantId: string, id: string, userId: string): Promise<void> {
        const transaction = await this.findOne(tenantId, id);

        // Reverte o saldo da conta
        await this.updateAccountBalance(
            tenantId,
            transaction.bank_account_id,
            transaction.amount,
            transaction.type === TransactionType.INCOME ? TransactionType.EXPENSE : TransactionType.INCOME
        );

        const { error } = await this.db.client
            .from('finance_transactions')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'TRANSACTION',
            entity_id: id,
            action: 'DELETE',
            actor_id: userId,
            old_value: transaction,
        });
    }

    /**
     * Obtém estatísticas do mês
     */
    async getMonthlyStats(tenantId: string, year: number, month: number): Promise<any> {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await this.db.client
            .from('finance_transactions')
            .select('type, amount')
            .eq('tenant_id', tenantId)
            .eq('status', TransactionStatus.COMPLETED)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate);

        if (error) throw new BadRequestException(error.message);

        const income = data?.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0) || 0;
        const expenses = data?.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0) || 0;

        return {
            year,
            month,
            income,
            expenses,
            balance: income - expenses,
            transactionCount: data?.length || 0,
        };
    }

    /**
     * Obtém transações agrupadas por categoria
     */
    async getByCategory(tenantId: string, startDate: string, endDate: string): Promise<any[]> {
        const { data, error } = await this.db.client
            .from('finance_transactions')
            .select('category_id, type, amount, category:finance_categories(name, color)')
            .eq('tenant_id', tenantId)
            .eq('status', TransactionStatus.COMPLETED)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate);

        if (error) throw new BadRequestException(error.message);

        // Agrupa por categoria
        const grouped = data?.reduce((acc: Record<string, any>, transaction: any) => {
            const categoryId = transaction.category_id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    category_id: categoryId,
                    category_name: transaction.category?.name,
                    category_color: transaction.category?.color,
                    income: 0,
                    expenses: 0,
                };
            }

            if (transaction.type === TransactionType.INCOME) {
                acc[categoryId].income += transaction.amount;
            } else {
                acc[categoryId].expenses += transaction.amount;
            }

            return acc;
        }, {});

        return Object.values(grouped || {});
    }

    /**
     * Obtém fluxo de caixa diário
     */
    async getDailyCashFlow(tenantId: string, startDate: string, endDate: string): Promise<any[]> {
        const { data, error } = await this.db.client
            .from('finance_transactions')
            .select('transaction_date, type, amount')
            .eq('tenant_id', tenantId)
            .eq('status', TransactionStatus.COMPLETED)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
            .order('transaction_date', { ascending: true });

        if (error) throw new BadRequestException(error.message);

        // Agrupa por dia
        const grouped = data?.reduce((acc: Record<string, any>, transaction: any) => {
            const date = transaction.transaction_date;
            if (!acc[date]) {
                acc[date] = { date, income: 0, expenses: 0 };
            }

            if (transaction.type === TransactionType.INCOME) {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expenses += transaction.amount;
            }

            return acc;
        }, {});

        return Object.values(grouped || {}).map((day: any) => ({
            ...day,
            balance: day.income - day.expenses,
        }));
    }

    /**
     * Atualiza o saldo da conta bancária
     */
    private async updateAccountBalance(
        tenantId: string,
        accountId: string,
        amount: number,
        type: TransactionType
    ): Promise<void> {
        const { data: account } = await this.db.client
            .from('finance_accounts')
            .select('current_balance')
            .eq('id', accountId)
            .eq('tenant_id', tenantId)
            .single();

        if (!account) throw new BadRequestException('Conta bancária não encontrada');

        const newBalance =
            type === TransactionType.INCOME
                ? account.current_balance + amount
                : account.current_balance - amount;

        await this.db.client
            .from('finance_accounts')
            .update({ current_balance: newBalance })
            .eq('id', accountId)
            .eq('tenant_id', tenantId);
    }
}
