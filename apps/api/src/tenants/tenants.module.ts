import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { AuthModule } from '../auth/auth.module';
import { SendGridService } from '../services/sendgrid.service';

@Module({
    imports: [AuthModule],
    controllers: [TenantsController],
    providers: [TenantsService, SendGridService],
    exports: [TenantsService],
})
export class TenantsModule { }
