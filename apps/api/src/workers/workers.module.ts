import { Module } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
import { WorkersController } from './workers.controller';
import { CrmModule } from '../crm/crm.module';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [CrmModule, DatabaseModule],
    controllers: [WorkersController],
    providers: [CacheWarmerService],
})
export class WorkersModule { }
