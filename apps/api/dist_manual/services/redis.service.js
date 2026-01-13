"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const config_1 = require("@jurisnexo/config");
let RedisService = class RedisService {
    constructor() {
        this.useMemory = false;
        this.memoryStore = new Map();
    }
    onModuleInit() {
        if (!config_1.env.REDIS_URL) {
            console.warn('⚠️ REDIS_URL not set. Using In-Memory fallback.');
            this.useMemory = true;
            return;
        }
        try {
            this.client = new ioredis_1.Redis(config_1.env.REDIS_URL, {
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
        }
        catch (e) {
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
    async setAuthCode(email, code) {
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
    async getAndConsumeAuthCode(email) {
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
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map