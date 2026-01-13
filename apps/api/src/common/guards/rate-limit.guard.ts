import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private readonly redis: RedisService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const endpoint = req.path;

        // Simple key based on IP and Endpoint
        const key = `ratelimit:${endpoint}:${ip}`;

        const limit = 10; // 10 requests
        const window = 60; // per minute

        // Check global rate limit using helper
        const isLimited = await this.redis.isRateLimited(key, limit, window);

        if (isLimited) {
            throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
        }

        return true;
    }
}
