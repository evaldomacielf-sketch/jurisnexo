import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SendGridService } from './sendgrid.service';

@Global()
@Module({
    providers: [RedisService, SendGridService],
    exports: [RedisService, SendGridService],
})
export class ServicesModule { }
