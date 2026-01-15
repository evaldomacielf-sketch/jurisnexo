import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
    CreateWorkflowDto,
    UpdateWorkflowDto,
    TriggerType,
    WorkflowResponseDto,
} from '../dto/workflow.dto';

@Injectable()
export class WorkflowService {
    private readonly logger = new Logger(WorkflowService.name);

    constructor(private readonly database: DatabaseService) { }

    /**
     * Create a new workflow
     */
    async create(tenantId: string, userId: string, dto: CreateWorkflowDto): Promise<WorkflowResponseDto> {
        const { data, error } = await this.database.client
            .from('workflows')
            .insert({
                tenant_id: tenantId,
                created_by: userId,
                name: dto.name,
                description: dto.description,
                trigger_type: dto.trigger.type,
                trigger_config: dto.trigger,
                steps: dto.steps,
                is_active: dto.isActive ?? true,
            })
            .select()
            .single();

        if (error) throw error;

        this.logger.log(`Workflow created: ${data.id} - ${data.name}`);
        return this.mapToResponse(data);
    }

    /**
     * Get all workflows for tenant
     */
    async findAll(tenantId: string, options?: { isActive?: boolean; triggerType?: TriggerType }): Promise<WorkflowResponseDto[]> {
        let query = this.database.client
            .from('workflows')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (options?.isActive !== undefined) {
            query = query.eq('is_active', options.isActive);
        }

        if (options?.triggerType) {
            query = query.eq('trigger_type', options.triggerType);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(this.mapToResponse);
    }

    /**
     * Get workflow by ID
     */
    async findById(id: string): Promise<WorkflowResponseDto> {
        const { data, error } = await this.database.client
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException('Workflow não encontrado');
        return this.mapToResponse(data);
    }

    /**
     * Update workflow
     */
    async update(id: string, dto: UpdateWorkflowDto): Promise<WorkflowResponseDto> {
        const updateData: any = { updated_at: new Date() };

        if (dto.name) updateData.name = dto.name;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.trigger) {
            updateData.trigger_type = dto.trigger.type;
            updateData.trigger_config = dto.trigger;
        }
        if (dto.steps) updateData.steps = dto.steps;
        if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

        const { data, error } = await this.database.client
            .from('workflows')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapToResponse(data);
    }

    /**
     * Delete workflow
     */
    async delete(id: string): Promise<void> {
        await this.database.client
            .from('workflows')
            .delete()
            .eq('id', id);
    }

    /**
     * Toggle workflow active status
     */
    async toggleActive(id: string): Promise<WorkflowResponseDto> {
        const workflow = await this.findById(id);

        const { data, error } = await this.database.client
            .from('workflows')
            .update({ is_active: !workflow.isActive })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapToResponse(data);
    }

    /**
     * Get workflows by trigger type
     */
    async findByTrigger(tenantId: string, triggerType: TriggerType): Promise<WorkflowResponseDto[]> {
        const { data, error } = await this.database.client
            .from('workflows')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('trigger_type', triggerType)
            .eq('is_active', true);

        if (error) throw error;
        return (data || []).map(this.mapToResponse);
    }

    /**
     * Duplicate workflow
     */
    async duplicate(id: string, tenantId: string, userId: string): Promise<WorkflowResponseDto> {
        const original = await this.findById(id);

        return this.create(tenantId, userId, {
            name: `${original.name} (cópia)`,
            description: original.description,
            trigger: original.trigger,
            steps: original.steps,
            isActive: false, // Start disabled
        });
    }

    /**
     * Get execution history for workflow
     */
    async getExecutions(workflowId: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.database.client
            .from('workflow_executions')
            .select('*', { count: 'exact' })
            .eq('workflow_id', workflowId)
            .order('started_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            items: data,
            total: count,
            page,
            limit,
        };
    }

    /**
     * Get workflow statistics
     */
    async getStats(tenantId: string) {
        const { data: workflows } = await this.database.client
            .from('workflows')
            .select('id, is_active')
            .eq('tenant_id', tenantId);

        const { data: executions } = await this.database.client
            .from('workflow_executions')
            .select('status')
            .in('workflow_id', (workflows || []).map(w => w.id));

        const totalWorkflows = workflows?.length || 0;
        const activeWorkflows = workflows?.filter(w => w.is_active).length || 0;
        const totalExecutions = executions?.length || 0;
        const successfulExecutions = executions?.filter(e => e.status === 'completed').length || 0;
        const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0;

        return {
            totalWorkflows,
            activeWorkflows,
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : 0,
        };
    }

    /**
     * Map database row to response DTO
     */
    private mapToResponse(row: any): WorkflowResponseDto {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            trigger: row.trigger_config,
            steps: row.steps,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastExecutedAt: row.last_executed_at,
            executionCount: row.execution_count,
        };
    }
}
