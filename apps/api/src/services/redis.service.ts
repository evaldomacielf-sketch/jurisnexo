import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '@jurisnexo/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: Redis;
    private useMemory = false;
    private memoryStore = new Map<string, { value: string; expires: number }>();

    onModuleInit() {
        if (!env.REDIS_URL && !env.REDIS_HOST) {
            console.warn('⚠️ REDIS_URL and REDIS_HOST not set. Using In-Memory fallback.');
            this.useMemory = true;
            return;
        }
        try {
            const connectionOptions = env.REDIS_URL ?
                env.REDIS_URL :
                {
                    host: env.REDIS_HOST,
                    port: env.REDIS_PORT || 6379,
                    // Generic defaults
                };

            this.client = new Redis(connectionOptions as any, {
                // Robust settings as requested
                enableReadyCheck: true,
                maxRetriesPerRequest: 3,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });

            this.client.on('error', (err) => {
                console.error('Redis connection error:', err);
                // We keep using Redis client in hopes it reconnects, 
                // but checking connection status might be needed for fallback logic.
            });

            this.client.on('connect', () => {
                console.log('🔌 Redis connected successfully');
                this.useMemory = false;
            });
        } catch (e) {
            console.warn('⚠️ Failed to configure Redis. Using In-Memory fallback.');
            this.useMemory = true;
        }
    }

    onModuleDestroy() {
        if (!this.useMemory) {
            this.client?.disconnect();
        }
    }

    async ping(): Promise<boolean> {
        if (this.useMemory) return true;
        try {
            const res = await this.client.ping();
            return res === 'PONG';
        } catch {
            return false;
        }
    }

    async delPattern(pattern: string): Promise<void> {
        if (this.useMemory) {
            // Simple regex match for memory store
            const regex = new RegExp(pattern.replace('*', '.*'));
            for (const key of this.memoryStore.keys()) {
                if (regex.test(key)) {
                    this.memoryStore.delete(key);
                }
            }
            return;
        }

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } catch (e) {
            console.error('Error deleting pattern', e);
        }
    }

    private hits = 0;
    private misses = 0;
    private errors = 0;

    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            errors: this.errors,
            hitRate: hitRate.toFixed(2) + '%',
            total,
        };
    }

    /**
     * Generic Cache Set
     * @param ttl Seconds
     */
    async set(key: string, value: any, ttl = 300): Promise<void> {
        const serialized = JSON.stringify(value);
        if (this.useMemory) {
            this.memoryStore.set(key, {
                value: serialized,
                expires: Date.now() + ttl * 1000
            });
            return;
        }
        await this.client.set(key, serialized, 'EX', ttl);

        // Structured Log for Set
        console.log(JSON.stringify({
            severity: 'INFO',
            component: 'cache',
            operation: 'SET',
            key,
            ttl,
            timestamp: new Date().toISOString(),
        }));
    }

    /**
     * Generic Cache Get
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            let data: string | null = null;
            if (this.useMemory) {
                const item = this.memoryStore.get(key);
                if (item) {
                    if (Date.now() > item.expires) {
                        this.memoryStore.delete(key);
                    } else {
                        data = item.value;
                    }
                }
            } else {
                data = await this.client.get(key);
            }

            if (!data) {
                this.misses++;
                // Structured Log for MISS
                console.log(JSON.stringify({
                    severity: 'INFO',
                    component: 'cache',
                    operation: 'MISS',
                    key,
                    timestamp: new Date().toISOString(),
                }));
                return null;
            }

            this.hits++;
            // Structured Log for HIT
            console.log(JSON.stringify({
                severity: 'INFO',
                component: 'cache',
                operation: 'HIT',
                key,
                timestamp: new Date().toISOString(),
            }));
            return JSON.parse(data) as T;
        } catch (e: any) {
            this.errors++;
            console.error(JSON.stringify({
                severity: 'ERROR',
                component: 'cache',
                operation: 'GET_ERROR',
                key,
                error: e.message || String(e),
                timestamp: new Date().toISOString(),
            }));
            return null;
        }
    }

    /**
     * Cache-Aside Pattern: Tries to fetch from cache, if missing, fetches from source and caches it.
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl = 300,
    ): Promise<T> {
        // 1. Try cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // 2. Fetch from source
        const data = await fetchFn();

        // 3. Save to cache
        if (data !== undefined && data !== null) {
            await this.set(key, data, ttl);
        }

        return data;
    }

    async del(key: string): Promise<void> {
        if (this.useMemory) {
            this.memoryStore.delete(key);
            return;
        }
        await this.client.del(key);
    }

    /**
     * Store a one-time auth code with 120s expiration
     */
    async setAuthCode(email: string, code: string): Promise<void> {
        // Reuse generic set with specific key prefix
        const key = `auth:code:${email}`;
        // Auth codes expire in 600s (10 min)
        await this.set(key, code, 600);
    }

    /**
     * Retrieve and delete auth code atomically (One-Time Use)
     */
    async getAndConsumeAuthCode(email: string): Promise<string | null> {
        const key = `auth:code:${email}`;

        if (this.useMemory) {
            const val = await this.get<string>(key);
            if (val) await this.del(key);
            return val;
        }

        // GETDEL is atomic (Redis 6.2+)
        return this.client.getdel(key);
    }

    /**
     * Atomic Rate Limiter
     * Returns true if allowed, false if limit exceeded
     */
    async isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
        if (this.useMemory) {
            // Simple memory implementation
            const record = this.memoryStore.get(key);
            const now = Date.now();
            if (record && now < record.expires) {
                const count = JSON.parse(record.value) as number;
                if (count >= limit) return true;
                this.memoryStore.set(key, { value: JSON.stringify(count + 1), expires: record.expires });
                return false;
            }
            this.memoryStore.set(key, { value: "1", expires: now + (windowSeconds * 1000) });
            return false;
        }

        try {
            const count = await this.client.incr(key);
            if (count === 1) {
                await this.client.expire(key, windowSeconds);
            }
            return count > limit;
        } catch (e) {
            console.error(`Rate limit error: ${e}`);
            return false; // Fail open
        }
    }
}
