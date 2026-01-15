import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotService } from './services/chatbot.service';
import { EmbeddingsService } from './services/embeddings.service';
import { SemanticSearchService } from './services/semantic-search.service';
import { ChatbotController } from './controllers/chatbot.controller';
import { SearchController } from './controllers/search.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
    imports: [ConfigModule, SupabaseModule],
    controllers: [ChatbotController, SearchController],
    providers: [ChatbotService, EmbeddingsService, SemanticSearchService],
    exports: [ChatbotService, SemanticSearchService],
})
export class AiModule { }
