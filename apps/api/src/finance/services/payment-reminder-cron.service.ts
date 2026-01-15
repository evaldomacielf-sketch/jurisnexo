import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { EmailService, EmailTemplateData } from './email.service';

/**
 * Scheduled service for sending payment reminders.
 * Runs daily at 9:00 AM to check for upcoming payment due dates.
 */
@Injectable()
export class PaymentReminderCronService {
    private readonly logger = new Logger(PaymentReminderCronService.name);

    constructor(
        private readonly supabase: SupabaseClient,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Run daily at 9:00 AM to send payment reminders
     * for legal fees due in 3 days.
     */
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async processPaymentReminders() {
        this.logger.log('Starting payment reminder processing...');

        try {
            // Calculate the target date (3 days from now)
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            // Fetch pending legal fees with due date in 3 days
            const { data: pendingFees, error } = await this.supabase
                .from('legal_fees')
                .select(`
          id,
          description,
          total_value,
          amount_paid,
          due_date,
          payment_status,
          client_id,
          tenant_id,
          clients:client_id (
            id,
            name,
            email
          ),
          tenants:tenant_id (
            id,
            name
          )
        `)
                .eq('payment_status', 'pendente')
                .eq('due_date', targetDateStr);

            if (error) {
                this.logger.error('Error fetching pending fees:', error);
                return;
            }

            if (!pendingFees || pendingFees.length === 0) {
                this.logger.log('No payment reminders to send today');
                return;
            }

            this.logger.log(`Sending ${pendingFees.length} payment reminders...`);

            for (const fee of pendingFees) {
                await this.sendPaymentReminder(fee);
            }

            this.logger.log('Payment reminder processing completed');
        } catch (error) {
            this.logger.error('Error processing payment reminders:', error);
        }
    }

    /**
     * Send payment reminder for a specific legal fee.
     */
    private async sendPaymentReminder(fee: any) {
        try {
            const client = fee.clients;
            const tenant = fee.tenants;

            if (!client?.email) {
                this.logger.warn(`No email for client on fee ${fee.id}, skipping reminder`);
                return;
            }

            const pendingAmount = (fee.total_value || 0) - (fee.amount_paid || 0);

            // Generate payment link (this would integrate with payment portal)
            const paymentLink = `${process.env.APP_URL || 'https://app.jurisnexo.com'}/pagamento/fee/${fee.id}`;

            const templateData: EmailTemplateData = {
                clienteNome: client.name || 'Cliente',
                escritorioNome: tenant?.name || 'JurisNexo',
                valor: pendingAmount,
                dataVencimento: new Date(fee.due_date).toLocaleDateString('pt-BR'),
                linkPagamento: paymentLink,
                numeroHonorario: fee.id,
            };

            const result = await this.emailService.sendPaymentReminder(client.email, templateData);

            if (result) {
                this.logger.log(`Reminder sent for fee ${fee.id} to ${client.email}`);

                // Log the reminder in the database
                await this.logReminderSent(fee.id, client.email);
            }
        } catch (error) {
            this.logger.error(`Error sending reminder for fee ${fee.id}:`, error);
        }
    }

    /**
     * Log that a reminder was sent (for audit purposes).
     */
    private async logReminderSent(feeId: string, email: string) {
        try {
            await this.supabase
                .from('legal_fee_payments')
                .insert({
                    legal_fee_id: feeId,
                    amount: 0, // Not a payment, just a reminder log
                    payment_date: new Date().toISOString(),
                    payment_method: 'reminder',
                    notes: `Payment reminder sent to ${email}`,
                });
        } catch {
            // Logging failure shouldn't break the process
        }
    }

    /**
     * Process overdue payments - runs daily at 10:00 AM.
     * Updates status and optionally sends overdue notifications.
     */
    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async processOverduePayments() {
        this.logger.log('Processing overdue payments...');

        try {
            const today = new Date().toISOString().split('T')[0];

            // Update status of overdue payments
            const { data, error } = await this.supabase
                .from('legal_fees')
                .update({ payment_status: 'atrasado' })
                .eq('payment_status', 'pendente')
                .lt('due_date', today)
                .select('id');

            if (error) {
                this.logger.error('Error updating overdue status:', error);
                return;
            }

            if (data && data.length > 0) {
                this.logger.log(`Marked ${data.length} payments as overdue`);
            }
        } catch (error) {
            this.logger.error('Error processing overdue payments:', error);
        }
    }
}
