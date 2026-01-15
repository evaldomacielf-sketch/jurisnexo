import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface WebhookConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

@Injectable()
export class WebhookActionExecutor {
    private readonly logger = new Logger(WebhookActionExecutor.name);

    async execute(config: WebhookConfig): Promise<any> {
        this.logger.log(`Calling webhook: ${config.method} ${config.url}`);

        try {
            const response = await axios({
                method: config.method,
                url: config.url,
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers,
                },
                data: config.body,
                timeout: config.timeout || 30000,
            });

            this.logger.log(`Webhook response: ${response.status}`);

            return {
                success: true,
                status: response.status,
                data: response.data,
            };
        } catch (error: any) {
            this.logger.error(`Webhook failed: ${error.message}`);

            return {
                success: false,
                error: error.message,
                status: error.response?.status,
            };
        }
    }
}
