import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface TaskConfig {
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    caseId?: string;
    clientId?: string;
}

@Injectable()
export class TaskActionExecutor {
    private readonly logger = new Logger(TaskActionExecutor.name);

    constructor(private readonly database: DatabaseService) { }

    async execute(tenantId: string, config: TaskConfig): Promise<any> {
        this.logger.log(`Creating task: ${config.title}`);

        const { data, error } = await this.database.client
            .from('tasks')
            .insert({
                tenant_id: tenantId,
                title: config.title,
                description: config.description,
                assignee_id: config.assigneeId,
                due_date: config.dueDate,
                priority: config.priority || 'medium',
                case_id: config.caseId,
                client_id: config.clientId,
                status: 'pending',
                source: 'workflow',
            })
            .select()
            .single();

        if (error) throw error;

        this.logger.log(`Task created: ${data.id}`);
        return data;
    }
}
