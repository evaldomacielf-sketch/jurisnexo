import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotService } from './services/chatbot.service';
import { EmbeddingsService } from './services/embeddings.service';
import { SearchService } from './services/semantic-search.service';
import { ChatbotController } from './controllers/chatbot.controller';
import { SearchController } from './controllers/search.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    controllers: [ChatbotController, SearchController],
    providers: [ChatbotService, EmbeddingsService, SearchService],
    exports: [ChatbotService, SearchService],
})
export class AiModule { }
