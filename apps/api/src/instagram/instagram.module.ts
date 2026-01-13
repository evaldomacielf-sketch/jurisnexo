import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramMessagingService } from './instagram-messaging.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [InstagramController, InstagramWebhookController],
    providers: [InstagramService, InstagramMessagingService],
    exports: [InstagramService, InstagramMessagingService],
})
export class InstagramModule { }
