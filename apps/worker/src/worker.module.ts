import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
// @ts-ignore
import { DatabaseModule } from './database/database.module';
// @ts-ignore
import { ConfigModule } from '@jurisnexo/config';
import { HealthController } from './health.controller';
import { MessageSenderJob } from './message-sender.job';
import { SlaJob } from './sla.job';
import { CalendarEventJob } from './calendar-event.job';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
        ConfigModule
    ],
    controllers: [HealthController],
    providers: [MessageSenderJob, SlaJob, CalendarEventJob],
})
export class WorkerModule { }
