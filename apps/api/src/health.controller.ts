import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedisService } from './common/services/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly redis: RedisService) { }

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    async check() {
        const isRedisConnected = await this.redis.ping();
        const cacheStats = this.redis.getStats();

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'jurisnexo-api',
            version: '0.0.1',
            cache: {
                connected: isRedisConnected,
                ...cacheStats,
            },
        };
    }
}
