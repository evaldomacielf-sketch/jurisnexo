import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

// Mock dependency to avoid ESM issues
jest.mock('@jurisnexo/config', () => ({
    env: {
        REDIS_URL: '', // Default to empty for fallback
    },
}));

describe('RedisService', () => {
    let service: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RedisService],
        }).compile();

        service = module.get<RedisService>(RedisService);
        await service.onModuleInit();
    });

    afterEach(async () => {
        await service.onModuleDestroy();
        // Clear memory store manually if needed, but new instance per test handles it
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getOrSet', () => {
        it('should cache data on first call', async () => {
            let callCount = 0;
            const fetchFn = async () => {
                callCount++;
                return { id: '123', name: 'Test' };
            };

            // First call: executes fetchFn
            const result1 = await service.getOrSet('test-key', fetchFn, 300);
            expect(result1).toEqual({ id: '123', name: 'Test' });
            expect(callCount).toBe(1);

            // Second call: returns from cache
            const result2 = await service.getOrSet('test-key', fetchFn, 300);
            expect(result2).toEqual({ id: '123', name: 'Test' });
            expect(callCount).toBe(1); // Should not execute fetchFn again
        });
    });

    describe('invalidation', () => {
        it('should invalidate cache correctly', async () => {
            await service.set('test-key', { data: 'value' }, 60);

            const val1 = await service.get('test-key');
            expect(val1).toEqual({ data: 'value' });

            await service.del('test-key');

            const val2 = await service.get('test-key');
            expect(val2).toBeNull();
        });

        it('should invalidate by pattern', async () => {
            await service.set('tenant:1:data', 'val1', 60);
            await service.set('tenant:1:config', 'val2', 60);
            await service.set('tenant:2:data', 'val3', 60);

            await service.delPattern('tenant:1:*');

            const val1 = await service.get('tenant:1:data');
            const val2 = await service.get('tenant:1:config');
            const val3 = await service.get('tenant:2:data');

            expect(val1).toBeNull();
            expect(val2).toBeNull();
            expect(val3).toBe('val3');
        });
    });

    describe('TTL', () => {
        it('should respect TTL', async () => {
            // Short TTL 1s
            await service.set('test-ttl', { data: 'expire' }, 1);

            const value1 = await service.get('test-ttl');
            expect(value1).toEqual({ data: 'expire' });

            // Wait for expiration
            await new Promise((resolve) => setTimeout(resolve, 1100));

            const value2 = await service.get('test-ttl');
            expect(value2).toBeNull();
        });
    });
});
