import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../common/services/redis.service';
import { CacheTTL } from '../../common/constants/cache-ttl.constant';

@Injectable()
export class ConversationService {
    constructor(
        private readonly db: DatabaseService,
        private readonly redis: RedisService,
    ) { }

    private get supabase() {
        return this.db.client;
    }

    /**
     * Buscar conversa por ID (com cache)
     */
    async getById(conversationId: string, tenantId: string) {
        return this.redis.getOrSet(
            `conversation:${conversationId}`,
            async () => {
                const { data, error } = await this.supabase
                    .from('conversations')
                    .select(`
                        *,
                        contact:contacts(*),
                        messages(*)
                    `)
                    .eq('id', conversationId)
                    .eq('tenant_id', tenantId)
                    .single();

                if (error) throw new Error(error.message);
                return data;
            },
            CacheTTL.CONVERSATION // 5 minutos
        );
    }

    /**
     * Listar conversas (com cache)
     */
    async list(tenantId: string, filters?: { status?: string }) {
        const cacheKey = `conversations:${tenantId}:${JSON.stringify(filters || {})}`;

        return this.redis.getOrSet(
            cacheKey,
            async () => {
                let query = this.supabase
                    .from('conversations')
                    .select('*, contact:contacts(*)')
                    .eq('tenant_id', tenantId)
                    .order('updated_at', { ascending: false });

                if (filters?.status) {
                    query = query.eq('status', filters.status);
                }

                const { data, error } = await query;
                if (error) throw new Error(error.message);
                return data;
            },
            CacheTTL.CONVERSATION_LIST // 1 minuto
        );
    }

    /**
     * Criar conversa (invalidar cache de listagem)
     */
    async create(tenantId: string, data: any) {
        const { data: conversation, error } = await this.supabase
            .from('conversations')
            .insert({ ...data, tenant_id: tenantId })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Invalidar cache de listagem
        await this.redis.delPattern(`conversations:${tenantId}:*`);

        return conversation;
    }

    /**
     * Atualizar conversa (invalidar cache específico + listagem)
     */
    async update(conversationId: string, tenantId: string, data: any) {
        const { data: conversation, error } = await this.supabase
            .from('conversations')
            .update(data)
            .eq('id', conversationId)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Invalidar cache específico
        await this.redis.del(`conversation:${conversationId}`);

        // Invalidar cache de listagem
        await this.redis.delPattern(`conversations:${tenantId}:*`);

        return conversation;
    }

    /**
     * Deletar conversa
     */
    async delete(conversationId: string, tenantId: string) {
        const { error } = await this.supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId)
            .eq('tenant_id', tenantId);

        if (error) throw new Error(error.message);

        // Invalidar cache
        await this.redis.del(`conversation:${conversationId}`);
        await this.redis.delPattern(`conversations:${tenantId}:*`);
    }
}
