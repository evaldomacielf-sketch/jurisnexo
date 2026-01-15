import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SupabaseService } from '../../database/supabase.service';
import {
    TriggerType,
    ActionType,
    ExecutionStatus,
    WorkflowStepDto,
} from '../dto/workflow.dto';
import { WorkflowService } from './workflow.service';
import { EmailActionExecutor } from '../executors/email-action.executor';
import { WebhookActionExecutor } from '../executors/webhook-action.executor';
import { TaskActionExecutor } from '../executors/task-action.executor';
import { NotificationActionExecutor } from '../executors/notification-action.executor';

interface ExecutionContext {
    tenantId: string;
    workflowId: string;
    executionId: string;
    triggerData: Record<string, any>;
    variables: Record<string, any>;
}

@Injectable()
export class WorkflowExecutorService {
    private readonly logger = new Logger(WorkflowExecutorService.name);

    constructor(
        @InjectQueue('workflows') private readonly workflowQueue: Queue,
        private readonly supabase: SupabaseService,
        private readonly workflowService: WorkflowService,
        private readonly emailExecutor: EmailActionExecutor,
        private readonly webhookExecutor: WebhookActionExecutor,
        private readonly taskExecutor: TaskActionExecutor,
        private readonly notificationExecutor: NotificationActionExecutor,
    ) { }

    /**
     * Trigger workflows by event type
     */
    async triggerByEvent(tenantId: string, triggerType: TriggerType, eventData: Record<string, any>): Promise<void> {
        const workflows = await this.workflowService.findByTrigger(tenantId, triggerType);

        this.logger.log(`Found ${workflows.length} workflows for trigger ${triggerType}`);

        for (const workflow of workflows) {
            // Check trigger conditions
            if (this.checkTriggerConditions(workflow.trigger.conditions, eventData)) {
                await this.queueExecution(tenantId, workflow.id, eventData);
            }
        }
    }

    /**
     * Queue workflow for execution
     */
    async queueExecution(tenantId: string, workflowId: string, triggerData: Record<string, any>): Promise<string> {
        // Create execution record
        const { data: execution, error } = await this.supabase.client
            .from('workflow_executions')
            .insert({
                workflow_id: workflowId,
                tenant_id: tenantId,
                status: ExecutionStatus.PENDING,
                trigger_event: triggerData,
            })
            .select()
            .single();

        if (error) throw error;

        // Add to Bull queue
        await this.workflowQueue.add('execute', {
            tenantId,
            workflowId,
            executionId: execution.id,
            triggerData,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });

        this.logger.log(`Queued execution ${execution.id} for workflow ${workflowId}`);
        return execution.id;
    }

    /**
     * Execute workflow (called by Bull processor)
     */
    async execute(context: ExecutionContext): Promise<void> {
        const startTime = Date.now();

        try {
            // Update status to running
            await this.updateExecutionStatus(context.executionId, ExecutionStatus.RUNNING);

            // Get workflow
            const workflow = await this.workflowService.findById(context.workflowId);

            // Initialize variables from trigger data
            context.variables = {
                ...context.triggerData,
                _workflow: { id: workflow.id, name: workflow.name },
                _execution: { id: context.executionId, startedAt: new Date() },
            };

            // Execute steps sequentially
            const stepResults: any[] = [];
            for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
                const result = await this.executeStep(context, step);
                stepResults.push(result);

                // Stop if step failed and no error handling
                if (result.status === 'failed' && !step.action.config?.continueOnError) {
                    throw new Error(`Step ${step.order} failed: ${result.error}`);
                }

                // Update variables with step output
                if (result.output) {
                    context.variables[`step_${step.order}`] = result.output;
                }
            }

            // Mark as completed
            await this.completeExecution(context.executionId, stepResults, Date.now() - startTime);
            this.logger.log(`Workflow ${context.workflowId} completed in ${Date.now() - startTime}ms`);

        } catch (error: any) {
            this.logger.error(`Workflow execution failed: ${error.message}`, error.stack);
            await this.failExecution(context.executionId, error.message);
            throw error;
        }
    }

    /**
     * Execute a single step
     */
    private async executeStep(context: ExecutionContext, step: WorkflowStepDto): Promise<any> {
        const stepStartTime = Date.now();

        // Check step condition
        if (step.condition && !this.evaluateCondition(step.condition, context.variables)) {
            return {
                stepOrder: step.order,
                status: 'skipped',
                reason: 'Condition not met',
                executedAt: new Date(),
            };
        }

        try {
            // Process variable interpolation in config
            const processedConfig = this.interpolateVariables(step.action.config, context.variables);

            // Execute action
            let output: any;
            switch (step.action.type) {
                case ActionType.SEND_EMAIL:
                    output = await this.emailExecutor.execute(context.tenantId, processedConfig);
                    break;

                case ActionType.CALL_WEBHOOK:
                    output = await this.webhookExecutor.execute(processedConfig);
                    break;

                case ActionType.CREATE_TASK:
                    output = await this.taskExecutor.execute(context.tenantId, processedConfig);
                    break;

                case ActionType.CREATE_NOTIFICATION:
                    output = await this.notificationExecutor.execute(context.tenantId, processedConfig);
                    break;

                case ActionType.DELAY:
                    await this.delay(processedConfig.durationMs || 1000);
                    output = { delayed: true };
                    break;

                case ActionType.UPDATE_RECORD:
                    output = await this.updateRecord(context.tenantId, processedConfig);
                    break;

                case ActionType.CONDITION:
                    // Condition step - execute children based on result
                    const conditionMet = this.evaluateCondition(processedConfig.condition, context.variables);
                    const childrenToExecute = conditionMet ? step.children : processedConfig.elseChildren;

                    if (childrenToExecute) {
                        for (const childStep of childrenToExecute) {
                            await this.executeStep(context, childStep);
                        }
                    }
                    output = { conditionMet };
                    break;

                default:
                    throw new Error(`Unknown action type: ${step.action.type}`);
            }

            return {
                stepOrder: step.order,
                status: 'success',
                output,
                durationMs: Date.now() - stepStartTime,
                executedAt: new Date(),
            };

        } catch (error: any) {
            return {
                stepOrder: step.order,
                status: 'failed',
                error: error.message,
                durationMs: Date.now() - stepStartTime,
                executedAt: new Date(),
            };
        }
    }

    /**
     * Check trigger conditions
     */
    private checkTriggerConditions(conditions: Record<string, any> | undefined, data: Record<string, any>): boolean {
        if (!conditions || Object.keys(conditions).length === 0) return true;

        return Object.entries(conditions).every(([field, expected]) => {
            const actual = this.getNestedValue(data, field);
            return actual === expected;
        });
    }

    /**
     * Evaluate a condition
     */
    private evaluateCondition(condition: any, variables: Record<string, any>): boolean {
        const value = this.getNestedValue(variables, condition.field);

        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'not_equals':
                return value !== condition.value;
            case 'contains':
                return String(value).includes(condition.value);
            case 'greater_than':
                return Number(value) > Number(condition.value);
            case 'less_than':
                return Number(value) < Number(condition.value);
            default:
                return false;
        }
    }

    /**
     * Interpolate variables in config
     */
    private interpolateVariables(obj: any, variables: Record<string, any>): any {
        if (typeof obj === 'string') {
            return obj.replace(/\{\{(.+?)\}\}/g, (_, key) => {
                return this.getNestedValue(variables, key.trim()) ?? '';
            });
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.interpolateVariables(item, variables));
        }

        if (typeof obj === 'object' && obj !== null) {
            const result: any = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.interpolateVariables(value, variables);
            }
            return result;
        }

        return obj;
    }

    /**
     * Get nested value from object
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    /**
     * Update record action
     */
    private async updateRecord(tenantId: string, config: any): Promise<any> {
        const { table, id, updates } = config;

        const { data, error } = await this.supabase.client
            .from(table)
            .update(updates)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Helper: delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update execution status
     */
    private async updateExecutionStatus(executionId: string, status: ExecutionStatus): Promise<void> {
        await this.supabase.client
            .from('workflow_executions')
            .update({ status, started_at: new Date() })
            .eq('id', executionId);
    }

    /**
     * Complete execution
     */
    private async completeExecution(executionId: string, stepResults: any[], durationMs: number): Promise<void> {
        await this.supabase.client
            .from('workflow_executions')
            .update({
                status: ExecutionStatus.COMPLETED,
                completed_at: new Date(),
                step_results: stepResults,
                duration_ms: durationMs,
            })
            .eq('id', executionId);
    }

    /**
     * Fail execution
     */
    private async failExecution(executionId: string, error: string): Promise<void> {
        await this.supabase.client
            .from('workflow_executions')
            .update({
                status: ExecutionStatus.FAILED,
                completed_at: new Date(),
                error,
            })
            .eq('id', executionId);
    }
}
