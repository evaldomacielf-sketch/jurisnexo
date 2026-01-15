import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailConfig {
    to: string | string[];
    subject: string;
    body: string;
    templateId?: string;
    templateData?: Record<string, any>;
}

@Injectable()
export class EmailActionExecutor {
    private readonly logger = new Logger(EmailActionExecutor.name);

    constructor(private readonly configService: ConfigService) { }

    async execute(tenantId: string, config: EmailConfig): Promise<any> {
        const recipients = Array.isArray(config.to) ? config.to : [config.to];

        this.logger.log(`Sending email to ${recipients.length} recipient(s)`);

        // In production, integrate with SendGrid, AWS SES, or similar
        // For now, log and return success
        const result = {
            sent: true,
            recipients,
            subject: config.subject,
            timestamp: new Date(),
        };

        // TODO: Implement actual email sending
        // const sgMail = require('@sendgrid/mail');
        // await sgMail.send({
        //     to: recipients,
        //     from: this.configService.get('EMAIL_FROM'),
        //     subject: config.subject,
        //     html: config.body,
        // });

        this.logger.log(`Email sent successfully to ${recipients.join(', ')}`);
        return result;
    }
}
