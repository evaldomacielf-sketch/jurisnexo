import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ChunkResult {
    content: string;
    index: number;
    tokens: number;
}

@Injectable()
export class EmbeddingsService {
    private readonly logger = new Logger(EmbeddingsService.name);
    private readonly openai: OpenAI;
    private readonly model = 'text-embedding-3-large';
    private readonly dimensions = 3072; // Max for text-embedding-3-large
    private readonly maxTokensPerChunk = 512;

    constructor(private readonly configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    /**
     * Generate embedding for a single text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: this.model,
            input: text,
            dimensions: this.dimensions,
        });

        return response.data[0].embedding;
    }

    /**
     * Generate embeddings for multiple texts (batch)
     */
    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        const startTime = Date.now();

        // OpenAI allows up to 2048 items per batch
        const batchSize = 100;
        const embeddings: number[][] = [];

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);

            const response = await this.openai.embeddings.create({
                model: this.model,
                input: batch,
                dimensions: this.dimensions,
            });

            embeddings.push(...response.data.map(d => d.embedding));
        }

        this.logger.log(`Generated ${embeddings.length} embeddings in ${Date.now() - startTime}ms`);
        return embeddings;
    }

    /**
     * Split text into chunks optimized for embeddings
     */
    chunkText(text: string, overlapPercent = 10): ChunkResult[] {
        const chunks: ChunkResult[] = [];
        const sentences = this.splitIntoSentences(text);

        let currentChunk = '';
        let currentTokens = 0;
        let chunkIndex = 0;

        for (const sentence of sentences) {
            const sentenceTokens = this.estimateTokens(sentence);

            // If sentence alone exceeds max, split it
            if (sentenceTokens > this.maxTokensPerChunk) {
                // Save current chunk first
                if (currentChunk) {
                    chunks.push({
                        content: currentChunk.trim(),
                        index: chunkIndex++,
                        tokens: currentTokens,
                    });
                }

                // Split long sentence into smaller pieces
                const pieces = this.splitLongSentence(sentence);
                for (const piece of pieces) {
                    chunks.push({
                        content: piece.trim(),
                        index: chunkIndex++,
                        tokens: this.estimateTokens(piece),
                    });
                }

                currentChunk = '';
                currentTokens = 0;
                continue;
            }

            // If adding sentence exceeds max, save current chunk
            if (currentTokens + sentenceTokens > this.maxTokensPerChunk) {
                chunks.push({
                    content: currentChunk.trim(),
                    index: chunkIndex++,
                    tokens: currentTokens,
                });

                // Calculate overlap from end of previous chunk
                const overlapTokens = Math.floor(currentTokens * (overlapPercent / 100));
                const overlapText = this.getOverlapText(currentChunk, overlapTokens);

                currentChunk = overlapText + ' ' + sentence;
                currentTokens = this.estimateTokens(currentChunk);
            } else {
                currentChunk += ' ' + sentence;
                currentTokens += sentenceTokens;
            }
        }

        // Save last chunk
        if (currentChunk.trim()) {
            chunks.push({
                content: currentChunk.trim(),
                index: chunkIndex,
                tokens: currentTokens,
            });
        }

        return chunks;
    }

    /**
     * Split text into sentences
     */
    private splitIntoSentences(text: string): string[] {
        // Handle legal document patterns (Art., § , etc.)
        const normalized = text
            .replace(/\n{2,}/g, ' [PARAGRAPH_BREAK] ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ');

        // Split on sentence-ending punctuation, but not on abbreviations
        const sentencePattern = /(?<=[.!?])\s+(?=[A-ZÀ-Ú])/g;
        const sentences = normalized.split(sentencePattern);

        return sentences
            .flatMap(s => s.split('[PARAGRAPH_BREAK]'))
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /**
     * Split a long sentence into smaller pieces
     */
    private splitLongSentence(sentence: string): string[] {
        const words = sentence.split(/\s+/);
        const pieces: string[] = [];
        let currentPiece = '';

        for (const word of words) {
            if (this.estimateTokens(currentPiece + ' ' + word) > this.maxTokensPerChunk) {
                if (currentPiece) pieces.push(currentPiece);
                currentPiece = word;
            } else {
                currentPiece += (currentPiece ? ' ' : '') + word;
            }
        }

        if (currentPiece) pieces.push(currentPiece);
        return pieces;
    }

    /**
     * Get overlap text from end of chunk
     */
    private getOverlapText(chunk: string, overlapTokens: number): string {
        const words = chunk.split(/\s+/);
        let overlapText = '';
        let tokens = 0;

        for (let i = words.length - 1; i >= 0; i--) {
            const word = words[i];
            tokens += this.estimateTokens(word);
            if (tokens > overlapTokens) break;
            overlapText = word + ' ' + overlapText;
        }

        return overlapText.trim();
    }

    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokens(text: string): number {
        // GPT models: ~4 chars per token for English, ~3 for Portuguese
        return Math.ceil(text.length / 3);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) throw new Error('Vectors must have same length');

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
