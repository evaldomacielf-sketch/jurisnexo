import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, IsEnum, ValidateNested, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// Trigger Types
// ============================================

export enum TriggerType {
    // Case triggers
    CASE_CREATED = 'case_created',
    CASE_STATUS_CHANGED = 'case_status_changed',
    CASE_DEADLINE_APPROACHING = 'case_deadline_approaching',

    // Client triggers
    CLIENT_CREATED = 'client_created',
    CLIENT_UPDATED = 'client_updated',

    // Finance triggers
    PAYMENT_RECEIVED = 'payment_received',
    PAYMENT_OVERDUE = 'payment_overdue',
    INVOICE_CREATED = 'invoice_created',

    // Document triggers
    DOCUMENT_UPLOADED = 'document_uploaded',

    // Scheduling triggers
    APPOINTMENT_CREATED = 'appointment_created',
    APPOINTMENT_REMINDER = 'appointment_reminder',

    // Manual
    MANUAL = 'manual',
    SCHEDULED = 'scheduled',
}

// ============================================
// Action Types
// ============================================

export enum ActionType {
    SEND_EMAIL = 'send_email',
    SEND_SMS = 'send_sms',
    SEND_WHATSAPP = 'send_whatsapp',
    CREATE_TASK = 'create_task',
    CREATE_EVENT = 'create_event',
    CREATE_NOTIFICATION = 'create_notification',
    CALL_WEBHOOK = 'call_webhook',
    UPDATE_RECORD = 'update_record',
    DELAY = 'delay',
    CONDITION = 'condition',
}

// ============================================
// Workflow DTOs
// ============================================

export class TriggerConfigDto {
    @ApiProperty({ enum: TriggerType })
    @IsEnum(TriggerType)
    type: TriggerType;

    @ApiPropertyOptional({ description: 'Condições adicionais do trigger' })
    @IsObject()
    @IsOptional()
    conditions?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Para triggers agendados: cron expression' })
    @IsString()
    @IsOptional()
    cronExpression?: string;
}

export class ActionConfigDto {
    @ApiProperty({ enum: ActionType })
    @IsEnum(ActionType)
    type: ActionType;

    @ApiProperty({ description: 'Configuração específica da ação' })
    @IsObject()
    config: Record<string, any>;
}

export class WorkflowStepDto {
    @ApiProperty()
    @IsNumber()
    order: number;

    @ApiProperty({ type: ActionConfigDto })
    @ValidateNested()
    @Type(() => ActionConfigDto)
    action: ActionConfigDto;

    @ApiPropertyOptional({ description: 'Condição para executar este passo' })
    @IsObject()
    @IsOptional()
    condition?: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
        value: any;
    };

    @ApiPropertyOptional({ description: 'Passos filhos (para branches)' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkflowStepDto)
    @IsOptional()
    children?: WorkflowStepDto[];
}

export class CreateWorkflowDto {
    @ApiProperty({ description: 'Nome do workflow' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Descrição do workflow' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: TriggerConfigDto })
    @ValidateNested()
    @Type(() => TriggerConfigDto)
    trigger: TriggerConfigDto;

    @ApiProperty({ type: [WorkflowStepDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkflowStepDto)
    steps: WorkflowStepDto[];

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateWorkflowDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ type: TriggerConfigDto })
    @ValidateNested()
    @Type(() => TriggerConfigDto)
    @IsOptional()
    trigger?: TriggerConfigDto;

    @ApiPropertyOptional({ type: [WorkflowStepDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkflowStepDto)
    @IsOptional()
    steps?: WorkflowStepDto[];

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

// ============================================
// Execution DTOs
// ============================================

export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export class WorkflowExecutionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    workflowId: string;

    @ApiProperty({ enum: ExecutionStatus })
    status: ExecutionStatus;

    @ApiProperty()
    triggerEvent: Record<string, any>;

    @ApiPropertyOptional()
    startedAt?: Date;

    @ApiPropertyOptional()
    completedAt?: Date;

    @ApiPropertyOptional()
    error?: string;

    @ApiProperty()
    stepResults: {
        stepOrder: number;
        status: 'success' | 'failed' | 'skipped';
        output?: any;
        error?: string;
        executedAt: Date;
    }[];
}

export class ExecuteWorkflowDto {
    @ApiProperty({ description: 'Dados do evento que disparou o workflow' })
    @IsObject()
    triggerData: Record<string, any>;
}

// ============================================
// Response DTOs
// ============================================

export class WorkflowResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    trigger: TriggerConfigDto;

    @ApiProperty()
    steps: WorkflowStepDto[];

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    lastExecutedAt?: Date;

    @ApiPropertyOptional()
    executionCount?: number;
}
