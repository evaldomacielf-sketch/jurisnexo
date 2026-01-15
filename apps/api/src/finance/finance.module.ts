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
import { LegalFeesController } from './controllers/legal-fees.controller';
import { FeeSplitController } from './controllers/fee-split.controller';
import { CashBookController } from './controllers/cash-book.controller';
import { PaymentPortalController } from './controllers/payment-portal.controller';

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
import { LegalFeesService } from './legal-fees.service'; // Keep in root as observed
import { FeeSplitService } from './services/fee-split.service';
import { CashBookService } from './services/cash-book.service';
import { PaymentPortalService } from './services/payment-portal.service';

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

        // Advanced Modules
        LegalFeesController,
        FeeSplitController,
        CashBookController,
        PaymentPortalController,
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

        // Advanced Modules Services
        LegalFeesService,
        FeeSplitService,
        CashBookService,
        PaymentPortalService,
    ],
    exports: [
        FinanceService,
        BankAccountService,
        TransactionService,
        RecurringTransactionService,
        BudgetService,
        CategoryService,
        LegalFeesService,
        FeeSplitService,
        CashBookService,
        PaymentPortalService,
    ],
})
export class FinanceModule { }
