import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { ReceivablesService } from './services/receivables.service';
import { PayablesService } from './services/payables.service';
import { ReportsService } from './services/reports.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [FinanceController],
    providers: [
        FinanceService,
        ReceivablesService,
        PayablesService,
        ReportsService,
    ],
    exports: [FinanceService],
})
export class FinanceModule { }
