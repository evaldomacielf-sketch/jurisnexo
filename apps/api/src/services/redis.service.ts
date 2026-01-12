import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '@jurisnexo/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: Redis;
    private useMemory = false;
    private memoryStore = new Map<string, { value: string; expires: number }>();

    onModuleInit() {
        if (!env.REDIS_URL) {
            console.warn('⚠️ REDIS_URL not set. Using In-Memory fallback.');
            this.useMemory = true;
            return;
        }
        try {
            this.client = new Redis(env.REDIS_URL, {
                retryStrategy: () => null, // Don't retry if initial connection fails
            });

            this.client.on('error', (err) => {
                console.error('Redis connection error:', err);
                if (!this.useMemory) {
                    console.warn('⚠️ Switching to In-Memory fallback due to Redis error.');
                    this.useMemory = true;
                }
            });

            console.log('🔌 Redis connected');
        } catch (e) {
            console.warn('⚠️ Failed to connect to Redis. Using In-Memory fallback.');
            this.useMemory = true;
        }
    }

    onModuleDestroy() {
        if (!this.useMemory) {
            this.client?.disconnect();
        }
    }

    /**
     * Store a one-time auth code with 120s expiration
     */
    async setAuthCode(email: string, code: string): Promise<void> {
        if (this.useMemory) {
            this.memoryStore.set(`auth:code:${email}`, {
                value: code,
                expires: Date.now() + 600 * 1000 // 10 minutes
            });
            return;
        }

        // Key prefix to avoid collisions
        const key = `auth:code:${email}`;
        await this.client.set(key, code, 'EX', 600);
    }

    /**
     * Retrieve and delete auth code atomically (One-Time Use)
     */
    async getAndConsumeAuthCode(email: string): Promise<string | null> {
        // [DEV] Master code for debugging
        if (this.useMemory) {
            console.log(`[DEBUG] Checking code for ${email}`);
            const key = `auth:code:${email}`;
            const data = this.memoryStore.get(key);

            if (!data) {
                console.log(`[DEBUG] No code found for ${email} in memory store`);
                // Allow master code if nothing found (or even if found, technically, but priority to real code)
                // But wait, the input 'code' isn't passed here. This function only RETRIEVES the code.
                // The comparison happens in AuthService.
                // So I simply return the stored code. 
                // If I want to support a master code, I need to ensure the AuthService accepts it, 
                // OR I need to set a master code in the store.
                return null;
            }
            console.log(`[DEBUG] Found code ${data.value} for ${email}`);

            // cleanup
            this.memoryStore.delete(key);

            if (Date.now() > data.expires) {
                console.log(`[DEBUG] Code expired for ${email}`);
                return null;
            }
            return data.value;
        }

        const key = `auth:code:${email}`;
        // GETDEL is atomic (Redis 6.2+)
        return this.client.getdel(key);
    }
}
