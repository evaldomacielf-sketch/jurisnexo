import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EmbeddingsService } from './embeddings.service';
import { SemanticSearchDto, SearchResponseDto, SearchResultDto, IndexDocumentDto, IndexResponseDto } from '../dto/ai.dto';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly database: DatabaseService,
        private readonly embeddingsService: EmbeddingsService,
    ) { }

    /**
     * Perform semantic search using pgvector
     */
    async search(tenantId: string, dto: SemanticSearchDto): Promise<SearchResponseDto> {
        const startTime = Date.now();

        // Generate embedding for query
        const embeddingStartTime = Date.now();
        const queryEmbedding = await this.embeddingsService.generateEmbedding(dto.query);
        const queryEmbeddingTime = Date.now() - embeddingStartTime;

        // Build filter conditions
        const filters: string[] = [`tenant_id = '${tenantId}'`];

        if (dto.documentTypes && dto.documentTypes.length > 0) {
            filters.push(`document_type IN (${dto.documentTypes.map(t => `'${t}'`).join(',')})`);
        }

        if (dto.tribunals && dto.tribunals.length > 0) {
            filters.push(`metadata->>'tribunal' IN (${dto.tribunals.map(t => `'${t}'`).join(',')})`);
        }

        if (dto.dateFrom) {
            filters.push(`(metadata->>'date')::date >= '${dto.dateFrom}'`);
        }

        if (dto.dateTo) {
            filters.push(`(metadata->>'date')::date <= '${dto.dateTo}'`);
        }

        const filterClause = filters.join(' AND ');
        const limit = dto.limit || 10;

        // Use pgvector's <=> operator for cosine distance
        const { data, error } = await this.database.client.rpc('search_embeddings', {
            query_embedding: queryEmbedding,
            filter_clause: filterClause,
            match_threshold: 0.3,
            match_count: limit,
        });

        if (error) {
            this.logger.error(`Search error: ${error.message}`);

            // Fallback to keyword search if vector search fails
            return this.fallbackKeywordSearch(tenantId, dto);
        }

        const searchTime = Date.now() - startTime;

        // Format results
        const results: SearchResultDto[] = (data || []).map((item: any) => ({
            id: item.id,
            documentType: item.document_type,
            title: this.extractTitle(item.content, item.metadata),
            content: item.content,
            similarity: item.similarity,
            metadata: item.metadata,
            citation: this.formatCitation(item),
        }));

        return {
            results,
            totalResults: results.length,
            queryEmbeddingTime,
            searchTime,
        };
    }

    /**
     * Hybrid search combining semantic and keyword matching
     */
    async hybridSearch(tenantId: string, dto: SemanticSearchDto): Promise<SearchResponseDto> {
        // Run both searches in parallel
        const [semanticResults, keywordResults] = await Promise.all([
            this.search(tenantId, dto),
            this.fallbackKeywordSearch(tenantId, dto),
        ]);

        // Merge and deduplicate results
        const mergedMap = new Map<string, SearchResultDto>();

        // Add semantic results with full weight
        for (const result of semanticResults.results) {
            mergedMap.set(result.id, result);
        }

        // Add keyword results with lower weight if not already present
        for (const result of keywordResults.results) {
            if (!mergedMap.has(result.id)) {
                result.similarity = result.similarity * 0.8; // Reduce score for keyword-only matches
                mergedMap.set(result.id, result);
            }
        }

        // Sort by similarity
        const results = Array.from(mergedMap.values())
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, dto.limit || 10);

        return {
            results,
            totalResults: results.length,
            queryEmbeddingTime: semanticResults.queryEmbeddingTime,
            searchTime: semanticResults.searchTime,
        };
    }

    /**
     * Fallback keyword search using PostgreSQL full-text search
     */
    private async fallbackKeywordSearch(tenantId: string, dto: SemanticSearchDto): Promise<SearchResponseDto> {
        const startTime = Date.now();

        // Use PostgreSQL full-text search
        const { data, error } = await this.database.client
            .from('ai_document_embeddings')
            .select('*')
            .eq('tenant_id', tenantId)
            .textSearch('content', dto.query, { type: 'websearch', config: 'portuguese' })
            .limit(dto.limit || 10);

        if (error) {
            this.logger.error(`Keyword search error: ${error.message}`);
            return { results: [], totalResults: 0, queryEmbeddingTime: 0, searchTime: Date.now() - startTime };
        }

        const results: SearchResultDto[] = (data || []).map((item: any, index: number) => ({
            id: item.id,
            documentType: item.document_type,
            title: this.extractTitle(item.content, item.metadata),
            content: item.content,
            similarity: 1 - (index * 0.05), // Approximate ranking
            metadata: item.metadata,
            citation: this.formatCitation(item),
        }));

        return {
            results,
            totalResults: results.length,
            queryEmbeddingTime: 0,
            searchTime: Date.now() - startTime,
        };
    }

    /**
     * Index a document for semantic search
     */
    async indexDocument(tenantId: string, dto: IndexDocumentDto): Promise<IndexResponseDto> {
        const startTime = Date.now();

        // Chunk the document
        const chunks = this.embeddingsService.chunkText(dto.content);
        this.logger.log(`Created ${chunks.length} chunks for document`);

        // Generate embeddings for all chunks
        const contents = chunks.map(c => c.content);
        const embeddings = await this.embeddingsService.generateBatchEmbeddings(contents);

        // Insert into database
        const records = chunks.map((chunk, idx) => ({
            tenant_id: tenantId,
            document_type: dto.documentType,
            source_id: dto.sourceId,
            chunk_index: chunk.index,
            content: chunk.content,
            embedding: embeddings[idx],
            metadata: dto.metadata,
        }));

        const { error } = await this.database.client
            .from('ai_document_embeddings')
            .insert(records);

        if (error) {
            this.logger.error(`Index error: ${error.message}`);
            throw error;
        }

        return {
            success: true,
            chunksCreated: chunks.length,
            embeddingsGenerated: embeddings.length,
            processingTimeMs: Date.now() - startTime,
        };
    }

    /**
     * Delete embeddings for a document
     */
    async deleteDocumentEmbeddings(sourceId: string): Promise<void> {
        await this.database.client
            .from('ai_document_embeddings')
            .delete()
            .eq('source_id', sourceId);
    }

    /**
     * Extract title from content or metadata
     */
    private extractTitle(content: string, metadata?: any): string {
        if (metadata?.titulo) return metadata.titulo;
        if (metadata?.numero) return `Processo ${metadata.numero}`;

        // Extract first line as title
        const firstLine = content.split('\n')[0];
        return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }

    /**
     * Format ABNT citation
     */
    private formatCitation(item: any): string {
        const meta = item.metadata || {};

        if (item.document_type === 'jurisprudence') {
            return `BRASIL. ${meta.tribunal || 'Tribunal'}. ${meta.numero || ''}. Relator: ${meta.relator || 'Min.'}. ${meta.date || ''}`;
        }

        if (item.document_type === 'legislation') {
            return `BRASIL. ${meta.tipo || 'Lei'} ${meta.numero || ''}, de ${meta.date || ''}.`;
        }

        return `Documento: ${item.id}`;
    }
}
