import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

// Controllers
import { FinanceController } from './finance.controller';
import { BankAccountController } from './controllers/bank-account.controller';
import { TransactionController } from './controllers/transaction.controller';
import { CategoryController } from './controllers/category.controller';

// Services
import { FinanceService } from './finance.service';
import { ReceivablesService } from './services/receivables.service';
import { PayablesService } from './services/payables.service';
import { ReportsService } from './services/reports.service';
import { BankAccountService } from './services/bank-account.service';
import { TransactionService } from './services/transaction.service';
import { CategoryService } from './services/category.service';

@Module({
    imports: [DatabaseModule],
    controllers: [
        FinanceController,
        BankAccountController,
        TransactionController,
        CategoryController,
    ],
    providers: [
        // Core Services
        FinanceService,
        ReceivablesService,
        PayablesService,
        ReportsService,
        // New Services
        BankAccountService,
        TransactionService,
        CategoryService,
    ],
    exports: [
        FinanceService,
        BankAccountService,
        TransactionService,
        CategoryService,
    ],
})
export class FinanceModule { }

