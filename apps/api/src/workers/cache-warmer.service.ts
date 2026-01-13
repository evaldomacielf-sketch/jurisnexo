import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../crm/conversations/conversation.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CacheWarmerService {
    private readonly logger = new Logger(CacheWarmerService.name);

    constructor(
        private readonly conversationService: ConversationService,
        private readonly db: DatabaseService,
    ) { }

    /**
     * Worker para pré-aquecer cache de dados críticos
     * Executar via Cloud Scheduler (a cada 5 minutos)
     */
    async warmCache() {
        this.logger.log('[CACHE WARMER] Starting...');

        // Buscar tenants ativos (últimas 24h)
        const activeTenants = await this.getActiveTenants();

        for (const tenant of activeTenants) {
            try {
                // Pré-carregar conversas abertas
                await this.conversationService.list(tenant.id, { status: 'open' });

                this.logger.log(`[CACHE WARMER] Warmed cache for tenant ${tenant.id}`);
            } catch (error) {
                this.logger.error(`[CACHE WARMER] Error for tenant ${tenant.id}:`, error);
            }
        }

        this.logger.log('[CACHE WARMER] Completed');
        return { status: 'completed', tenantsWarmed: activeTenants.length };
    }

    private async getActiveTenants() {
        // Tenants que tiveram logins recentes ou activity logs nas últimas 24h
        // Simplificado para todos os tenants por enquanto, ou usar uma query específica se a tabela logs existir
        const { data, error } = await this.db.client
            .from('tenants')
            .select('id')
            .eq('status', 'active'); // Assumindo coluna status

        if (error) {
            this.logger.error('Error fetching active tenants', error);
            return [];
        }
        return data || [];
    }
}
