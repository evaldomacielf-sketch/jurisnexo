import { Controller, Post, UseGuards } from '@nestjs/common';
import { CacheWarmerService } from './cache-warmer.service';
// import { ApiKeyGuard } from '../auth/api-key.guard'; // Futuro: Proteger endpoint

@Controller('workers')
export class WorkersController {
    constructor(private readonly cacheWarmer: CacheWarmerService) { }

    @Post('warm-cache')
    // @UseGuards(ApiKeyGuard) // Adicionar segurança para Cloud Scheduler
    async triggerCacheWarmer() {
        return this.cacheWarmer.warmCache();
    }
}
