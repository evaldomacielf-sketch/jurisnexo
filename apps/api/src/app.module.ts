import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validate } from './config/env.validation';
import { TenantsModule } from './tenants/tenants.module';
import { CrmModule } from './crm/crm.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { WorkersModule } from './workers/workers.module';

import { InstagramModule } from './instagram/instagram.module';
import { ClientsModule } from './clients/clients.module';
import { CasesModule } from './cases/cases.module';
import { ScheduleModule } from './schedule/schedule.module';
import { FinanceModule } from './finance/finance.module';
import { AiModule } from './ai/ai.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { CalendarModule } from './calendar/calendar.module';
import { ChatModule } from './chat/chat.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate,
        }),
        AuthModule,
        CommonModule,
        TenantsModule,
        CrmModule,
        SuperadminModule,
        EventsModule,
        WorkersModule,
        InstagramModule,
        ClientsModule,
        CasesModule,
        ScheduleModule,
        NestScheduleModule.forRoot(),
        FinanceModule,
        AiModule,
        WorkflowsModule,
        CalendarModule,
        ChatModule,
    ],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
