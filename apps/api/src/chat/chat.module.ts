import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './services/chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatController } from './controllers/chat.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService, ChatGateway],
})
export class ChatModule { }
