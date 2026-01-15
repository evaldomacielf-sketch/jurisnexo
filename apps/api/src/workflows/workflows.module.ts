import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from '../database/database.module';
import { WorkflowService } from './services/workflow.service';
import { WorkflowExecutorService } from './services/workflow-executor.service';
import { WorkflowController } from './controllers/workflow.controller';

// Action executors
import { EmailActionExecutor } from './executors/email-action.executor';
import { WebhookActionExecutor } from './executors/webhook-action.executor';
import { TaskActionExecutor } from './executors/task-action.executor';
import { NotificationActionExecutor } from './executors/notification-action.executor';

@Module({
    imports: [
        DatabaseModule,
        BullModule.registerQueue({
            name: 'workflows',
        }),
    ],
    controllers: [WorkflowController],
    providers: [
        WorkflowService,
        WorkflowExecutorService,
        EmailActionExecutor,
        WebhookActionExecutor,
        TaskActionExecutor,
        NotificationActionExecutor,
    ],
    exports: [WorkflowService, WorkflowExecutorService],
})
export class WorkflowsModule { }
