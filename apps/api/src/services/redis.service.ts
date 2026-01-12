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
                expires: Date.now() + 120 * 1000
            });
            return;
        }

        // Key prefix to avoid collisions
        const key = `auth:code:${email}`;
        await this.client.set(key, code, 'EX', 120);
    }

    /**
     * Retrieve and delete auth code atomically (One-Time Use)
     */
    async getAndConsumeAuthCode(email: string): Promise<string | null> {
        if (this.useMemory) {
            const key = `auth:code:${email}`;
            const data = this.memoryStore.get(key);

            if (!data) return null;

            // cleanup
            this.memoryStore.delete(key);

            if (Date.now() > data.expires) {
                return null;
            }
            return data.value;
        }

        const key = `auth:code:${email}`;
        // GETDEL is atomic (Redis 6.2+)
        return this.client.getdel(key);
    }

