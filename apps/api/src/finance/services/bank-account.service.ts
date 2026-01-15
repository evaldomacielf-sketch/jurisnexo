import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto } from '../dto/bank-account.dto';

@Injectable()
export class BankAccountService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Cria uma nova conta bancária
     */
    async create(
        tenantId: string,
        dto: CreateBankAccountDto,
        userId: string
    ): Promise<BankAccountResponseDto> {
        // Validar se já existe conta com mesmo número
        const { data: existing } = await this.db.client
            .from('finance_accounts')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('account_number', dto.account_number)
            .eq('bank_name', dto.bank_name)
            .single();

        if (existing) {
            throw new BadRequestException('Já existe uma conta com este número neste banco');
        }

        const { data, error } = await this.db.client
            .from('finance_accounts')
            .insert({
                tenant_id: tenantId,
                name: dto.name,
                bank_name: dto.bank_name,
                agency: dto.agency,
                account_number: dto.account_number,
                account_type: dto.account_type,
                current_balance: dto.initial_balance || 0,
                is_active: dto.is_active ?? true,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'ACCOUNT',
            entity_id: data.id,
            action: 'CREATE',
            actor_id: userId,
            new_value: data,
        });

        return data;
    }

    /**
     * Lista todas as contas bancárias do escritório
     */
    async findAll(tenantId: string, includeInactive = false): Promise<BankAccountResponseDto[]> {
        let query = this.db.client
            .from('finance_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw new BadRequestException(error.message);

        return data || [];
    }

    /**
     * Busca uma conta bancária específica
     */
    async findOne(tenantId: string, id: string): Promise<BankAccountResponseDto> {
        const { data, error } = await this.db.client
            .from('finance_accounts')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Conta bancária não encontrada');
        }

        return data;
    }

    /**
     * Atualiza uma conta bancária
     */
    async update(
        tenantId: string,
        id: string,
        dto: UpdateBankAccountDto,
        userId: string
    ): Promise<BankAccountResponseDto> {
        // Verifica se a conta existe
        const existing = await this.findOne(tenantId, id);

        const { data, error } = await this.db.client
            .from('finance_accounts')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'ACCOUNT',
            entity_id: id,
            action: 'UPDATE',
            actor_id: userId,
            old_value: existing,
            new_value: data,
        });

        return data;
    }

    /**
     * Remove (soft delete) uma conta bancária
     */
    async remove(tenantId: string, id: string, userId: string): Promise<void> {
        // Verifica se a conta existe
        const existing = await this.findOne(tenantId, id);

        // Verifica se há transações vinculadas
        const { count } = await this.db.client
            .from('finance_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('account_id', id);

        if (count && count > 0) {
            throw new BadRequestException(
                'Não é possível excluir uma conta com transações vinculadas. Desative-a ao invés disso.'
            );
        }

        const { error } = await this.db.client
            .from('finance_accounts')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'ACCOUNT',
            entity_id: id,
            action: 'DELETE',
            actor_id: userId,
            old_value: existing,
        });
    }

    /**
     * Obtém o saldo consolidado de todas as contas
     */
    async getConsolidatedBalance(tenantId: string): Promise<{ total: number; byAccount: any[] }> {
        const { data, error } = await this.db.client
            .from('finance_accounts')
            .select('id, name, current_balance, account_type')
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        if (error) throw new BadRequestException(error.message);

        const total = data?.reduce((sum, account) => sum + (account.current_balance || 0), 0) || 0;

        return {
            total,
            byAccount: data || [],
        };
    }

    /**
     * Atualiza o saldo de uma conta após uma transação
     */
    async updateBalance(
        tenantId: string,
        accountId: string,
        amount: number,
        isIncome: boolean
    ): Promise<void> {
        const account = await this.findOne(tenantId, accountId);
        const newBalance = isIncome
            ? account.current_balance + amount
            : account.current_balance - amount;

        const { error } = await this.db.client
            .from('finance_accounts')
            .update({ current_balance: newBalance })
            .eq('id', accountId)
            .eq('tenant_id', tenantId);

        if (error) throw new BadRequestException(error.message);
    }
}
