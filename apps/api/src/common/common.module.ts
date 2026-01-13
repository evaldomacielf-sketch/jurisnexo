import { Module, Global } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { PubSubService } from './services/pubsub.service';
import { GcpLoggerService } from './services/gcp-logger.service';

@Global()
@Module({
    providers: [
        RedisService,
        PubSubService,
        GcpLoggerService
    ],
    exports: [
        RedisService,
        PubSubService,
        GcpLoggerService
    ],
})
export class CommonModule { }
