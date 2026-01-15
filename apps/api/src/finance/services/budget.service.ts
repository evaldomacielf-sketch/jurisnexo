import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBudgetDto, UpdateBudgetDto, BudgetResponseDto } from '../dto/budget.dto';

@Injectable()
export class BudgetService {
    private readonly logger = new Logger(BudgetService.name);
    private readonly table = 'finance_budgets';

    constructor(private readonly db: DatabaseService) { }

    async create(
        tenantId: string,
        dto: CreateBudgetDto,
        userId: string
    ): Promise<BudgetResponseDto> {
        // Validate duplicates
        const { data: existing } = await this.db.client
            .from(this.table)
            .select('id')
            .eq('category_id', dto.category_id)
            .eq('year', dto.year)
            .eq('month', dto.month)
            .eq('tenant_id', tenantId)
            .single();

        if (existing) {
            throw new BadRequestException('Já existe um orçamento para esta categoria neste período.');
        }

        const { data, error } = await this.db.client
            .from(this.table)
            .insert({
                tenant_id: tenantId,
                ...dto,
                created_by: userId,
            })
            .select(`
                *,
                category:finance_categories!inner(name)
            `)
            .single();

        if (error) {
            this.logger.error(`Error creating budget: ${error.message}`, error);
            throw new BadRequestException('Erro ao criar orçamento.');
        }

        await this.logAudit(tenantId, 'CREATE', data.id, userId, null, data);

        return this.mapResponse(data);
    }

    async findAll(
        tenantId: string,
        year?: number,
        month?: number
    ): Promise<BudgetResponseDto[]> {
        let query = this.db.client
            .from(this.table)
            .select(`
                *,
                category:finance_categories!inner(name)
            `)
            .eq('tenant_id', tenantId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (year) query = query.eq('year', year);
        if (month) query = query.eq('month', month);

        const { data, error } = await query;

        if (error) {
            this.logger.error(`Error fetching budgets: ${error.message}`);
            throw new BadRequestException('Erro ao listar orçamentos.');
        }

        return data?.map(this.mapResponse) || [];
    }

    async findOne(tenantId: string, id: string): Promise<BudgetResponseDto> {
        const { data, error } = await this.db.client
            .from(this.table)
            .select(`
                *,
                category:finance_categories!inner(name)
            `)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Orçamento não encontrado.');
        }

        return this.mapResponse(data);
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateBudgetDto,
        userId: string
    ): Promise<BudgetResponseDto> {
        const existing = await this.findOne(tenantId, id);

        const { data, error } = await this.db.client
            .from(this.table)
            .update(dto)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select(`
                *,
                category:finance_categories!inner(name)
            `)
            .single();

        if (error) {
            this.logger.error(`Error updating budget: ${error.message}`);
            throw new BadRequestException('Erro ao atualizar orçamento.');
        }

        await this.logAudit(tenantId, 'UPDATE', id, userId, existing, data);
        return this.mapResponse(data);
    }

    async remove(tenantId: string, id: string, userId: string): Promise<void> {
        const existing = await this.findOne(tenantId, id);

        const { error } = await this.db.client
            .from(this.table)
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) {
            this.logger.error(`Error deleting budget: ${error.message}`);
            throw new BadRequestException('Erro ao excluir orçamento.');
        }

        await this.logAudit(tenantId, 'DELETE', id, userId, existing, null);
    }

    private mapResponse(data: any): BudgetResponseDto {
        return {
            id: data.id,
            category_id: data.category_id,
            category_name: data.category?.name,
            year: data.year,
            month: data.month,
            planned_amount: data.planned_amount,
            notes: data.notes,
            created_at: data.created_at,
        };
    }

    private async logAudit(
        tenantId: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        entityId: string,
        userId: string,
        oldValue?: any,
        newValue?: any
    ) {
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'BUDGET',
            entity_id: entityId,
            action,
            actor_id: userId,
            old_value: oldValue,
            new_value: newValue,
        });
    }
}
