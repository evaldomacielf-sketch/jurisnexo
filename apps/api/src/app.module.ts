import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { HealthController } from './health.controller';

@Module({
    imports: [AuthModule, TenantsModule],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
