import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

interface NotificationConfig {
    userId?: string;
    userIds?: string[];
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class NotificationActionExecutor {
    private readonly logger = new Logger(NotificationActionExecutor.name);

    constructor(private readonly supabase: SupabaseService) { }

    async execute(tenantId: string, config: NotificationConfig): Promise<any> {
        const userIds = config.userIds || (config.userId ? [config.userId] : []);

        if (userIds.length === 0) {
            throw new Error('No users specified for notification');
        }

        this.logger.log(`Creating notification for ${userIds.length} user(s)`);

        const notifications = userIds.map(userId => ({
            tenant_id: tenantId,
            user_id: userId,
            title: config.title,
            message: config.message,
            type: config.type || 'info',
            link: config.link,
            metadata: config.metadata,
            read: false,
            source: 'workflow',
        }));

        const { data, error } = await this.supabase.client
            .from('notifications')
            .insert(notifications)
            .select();

        if (error) throw error;

        this.logger.log(`Created ${data.length} notification(s)`);
        return { created: data.length, notifications: data };
    }
}
