import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

// Controllers
import { FinanceController } from './finance.controller';
import { BankAccountController } from './controllers/bank-account.controller';
import { TransactionController } from './controllers/transaction.controller';
import { RecurringTransactionController } from './controllers/recurring-transaction.controller';
import { BudgetController } from './controllers/budget.controller';
import { ReportsController } from './controllers/reports.controller';
import { CategoryController } from './controllers/category.controller';

// Services
import { FinanceService } from './finance.service';
import { ReceivablesService } from './services/receivables.service';
import { PayablesService } from './services/payables.service';
import { ReportsService } from './services/reports.service';
import { BankAccountService } from './services/bank-account.service';
import { TransactionService } from './services/transaction.service';
import { RecurringTransactionService } from './services/recurring-transaction.service';
import { BudgetService } from './services/budget.service';
import { FinanceCronService } from './services/finance-cron.service';
import { CategoryService } from './services/category.service';

@Module({
    imports: [DatabaseModule],
    controllers: [
        FinanceController,
        BankAccountController,
        TransactionController,
        RecurringTransactionController,
        BudgetController,
        ReportsController,
        CategoryController,
    ],
    providers: [
        // Core Services
        FinanceService,
        ReceivablesService,
        PayablesService,
        ReportsService,
        FinanceCronService,
        // New Services
        BankAccountService,
        TransactionService,
        RecurringTransactionService,
        BudgetService,
        CategoryService,
    ],
    exports: [
        FinanceService,
        BankAccountService,
        TransactionService,
        RecurringTransactionService,
        BudgetService,
        CategoryService,
    ],
})
export class FinanceModule { }
