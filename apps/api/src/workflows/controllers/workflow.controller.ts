import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowExecutorService } from '../services/workflow-executor.service';
import {
    CreateWorkflowDto,
    UpdateWorkflowDto,
    ExecuteWorkflowDto,
    TriggerType,
    WorkflowResponseDto,
} from '../dto/workflow.dto';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly executorService: WorkflowExecutorService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Criar novo workflow' })
    @ApiResponse({ status: 201, description: 'Workflow criado', type: WorkflowResponseDto })
    async create(
        @Req() req: any,
        @Body() dto: CreateWorkflowDto,
    ): Promise<WorkflowResponseDto> {
        return this.workflowService.create(req.user.tenantId, req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os workflows' })
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    @ApiQuery({ name: 'trigger', required: false, enum: TriggerType })
    @ApiResponse({ status: 200, description: 'Lista de workflows' })
    async findAll(
        @Req() req: any,
        @Query('active') active?: boolean,
        @Query('trigger') trigger?: TriggerType,
    ): Promise<WorkflowResponseDto[]> {
        return this.workflowService.findAll(req.user.tenantId, {
            isActive: active,
            triggerType: trigger,
        });
    }

    @Get('stats')
    @ApiOperation({ summary: 'Obter estatísticas de workflows' })
    async getStats(@Req() req: any) {
        return this.workflowService.getStats(req.user.tenantId);
    }

    @Get('templates')
    @ApiOperation({ summary: 'Obter templates de workflow pré-definidos' })
    getTemplates() {
        return [
            {
                id: 'deadline-reminder',
                name: 'Lembrete de Prazo',
                description: 'Notifica advogados 3 dias antes do vencimento',
                trigger: { type: TriggerType.CASE_DEADLINE_APPROACHING },
                steps: [
                    {
                        order: 1,
                        action: {
                            type: 'send_email',
                            config: {
                                to: '{{case.lawyer.email}}',
                                subject: 'Prazo Próximo: {{case.title}}',
                                body: 'O prazo do caso {{case.number}} vence em {{deadline.daysLeft}} dias.',
                            },
                        },
                    },
                    {
                        order: 2,
                        action: {
                            type: 'create_notification',
                            config: {
                                userId: '{{case.lawyer.id}}',
                                title: 'Prazo Próximo',
                                message: '{{case.title}} vence em {{deadline.daysLeft}} dias',
                                type: 'warning',
                            },
                        },
                    },
                ],
            },
            {
                id: 'new-client-welcome',
                name: 'Boas-vindas ao Cliente',
                description: 'Envia email de boas-vindas para novos clientes',
                trigger: { type: TriggerType.CLIENT_CREATED },
                steps: [
                    {
                        order: 1,
                        action: {
                            type: 'send_email',
                            config: {
                                to: '{{client.email}}',
                                subject: 'Bem-vindo ao escritório!',
                                body: 'Olá {{client.name}}, seja bem-vindo!',
                            },
                        },
                    },
                ],
            },
            {
                id: 'payment-overdue',
                name: 'Cobrança de Pagamento',
                description: 'Notifica sobre pagamentos em atraso',
                trigger: { type: TriggerType.PAYMENT_OVERDUE },
                steps: [
                    {
                        order: 1,
                        action: {
                            type: 'send_email',
                            config: {
                                to: '{{client.email}}',
                                subject: 'Pagamento Pendente',
                                body: 'Identificamos um pagamento pendente de R$ {{payment.amount}}.',
                            },
                        },
                    },
                    {
                        order: 2,
                        action: {
                            type: 'create_task',
                            config: {
                                title: 'Contatar cliente sobre pagamento',
                                description: 'Entrar em contato com {{client.name}} sobre pagamento pendente',
                                priority: 'high',
                            },
                        },
                    },
                ],
            },
            {
                id: 'case-status-update',
                name: 'Atualização de Status',
                description: 'Notifica cliente sobre mudança de status do caso',
                trigger: { type: TriggerType.CASE_STATUS_CHANGED },
                steps: [
                    {
                        order: 1,
                        action: {
                            type: 'send_email',
                            config: {
                                to: '{{case.client.email}}',
                                subject: 'Atualização do seu processo',
                                body: 'O status do seu processo foi atualizado para: {{case.status}}',
                            },
                        },
                    },
                ],
            },
        ];
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter workflow por ID' })
    @ApiResponse({ status: 200, type: WorkflowResponseDto })
    async findById(@Param('id') id: string): Promise<WorkflowResponseDto> {
        return this.workflowService.findById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar workflow' })
    @ApiResponse({ status: 200, type: WorkflowResponseDto })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateWorkflowDto,
    ): Promise<WorkflowResponseDto> {
        return this.workflowService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir workflow' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.workflowService.delete(id);
    }

    @Post(':id/toggle')
    @ApiOperation({ summary: 'Ativar/desativar workflow' })
    @ApiResponse({ status: 200, type: WorkflowResponseDto })
    async toggle(@Param('id') id: string): Promise<WorkflowResponseDto> {
        return this.workflowService.toggleActive(id);
    }

    @Post(':id/duplicate')
    @ApiOperation({ summary: 'Duplicar workflow' })
    @ApiResponse({ status: 201, type: WorkflowResponseDto })
    async duplicate(
        @Param('id') id: string,
        @Req() req: any,
    ): Promise<WorkflowResponseDto> {
        return this.workflowService.duplicate(id, req.user.tenantId, req.user.id);
    }

    @Post(':id/execute')
    @ApiOperation({ summary: 'Executar workflow manualmente' })
    async execute(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: ExecuteWorkflowDto,
    ): Promise<{ executionId: string }> {
        const executionId = await this.executorService.queueExecution(
            req.user.tenantId,
            id,
            dto.triggerData,
        );
        return { executionId };
    }

    @Get(':id/executions')
    @ApiOperation({ summary: 'Obter histórico de execuções' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getExecutions(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.workflowService.getExecutions(id, page, limit);
    }
}
