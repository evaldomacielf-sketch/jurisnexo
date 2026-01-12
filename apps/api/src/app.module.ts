import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { CrmModule } from './crm/crm.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health.controller';

@Module({
    imports: [AuthModule, TenantsModule, CrmModule, SuperadminModule, EventsModule],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
