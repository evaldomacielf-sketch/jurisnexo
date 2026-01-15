import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class FinanceCronService {
    private readonly logger = new Logger(FinanceCronService.name);

    constructor(private readonly db: DatabaseService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleRecurringTransactions() {
        this.logger.log('Starting recurring transactions generation...');

        try {
            const { data, error } = await this.db.client.rpc('generate_recurring_transactions');

            if (error) {
                this.logger.error(`Error generating recurring transactions: ${error.message}`, error);
                return;
            }

            if (data > 0) {
                this.logger.log(`Successfully generated ${data} recurring transactions.`);
            } else {
                this.logger.log('No recurring transactions to generate today.');
            }
        } catch (error) {
            this.logger.error('Unexpected error in recurring transactions cron job', error);
        }
    }
}
