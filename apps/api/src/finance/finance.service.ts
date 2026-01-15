import { Injectable } from '@nestjs/common';
import { ReceivablesService } from './services/receivables.service';
import { PayablesService } from './services/payables.service';
import { ReportsService } from './services/reports.service';

/**
 * Main Finance Service - Facade for all finance operations
 */
@Injectable()
export class FinanceService {
    constructor(
        public readonly receivables: ReceivablesService,
        public readonly payables: PayablesService,
        public readonly reports: ReportsService,
    ) { }
}
