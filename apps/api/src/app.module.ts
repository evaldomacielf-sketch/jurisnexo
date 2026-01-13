import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { CrmModule } from './crm/crm.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { WorkersModule } from './workers/workers.module';

import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            validate,
            isGlobal: true,
        }),
        CommonModule, AuthModule, TenantsModule, CrmModule, SuperadminModule, EventsModule, WorkersModule
    ],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
