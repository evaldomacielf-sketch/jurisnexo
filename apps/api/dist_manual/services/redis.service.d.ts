import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    private useMemory;
    private memoryStore;
    onModuleInit(): void;
    onModuleDestroy(): void;
    /**
     * Store a one-time auth code with 120s expiration
     */
    setAuthCode(email: string, code: string): Promise<void>;
    /**
     * Retrieve and delete auth code atomically (One-Time Use)
     */
    getAndConsumeAuthCode(email: string): Promise<string | null>;
}
//# sourceMappingURL=redis.service.d.ts.map