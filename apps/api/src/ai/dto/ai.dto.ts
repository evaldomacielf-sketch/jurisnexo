import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, IsEnum, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// Chatbot DTOs
// ============================================

export class ChatMessageDto {
    @ApiProperty({ description: 'Mensagem do usuário' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'ID da conversa (para continuar uma conversa existente)' })
    @IsUUID()
    @IsOptional()
    conversationId?: string;

    @ApiPropertyOptional({ description: 'Contexto adicional (IDs de processos, clientes, etc.)' })
    @IsOptional()
    context?: {
        caseId?: string;
        clientId?: string;
        documentId?: string;
    };

    @ApiPropertyOptional({ description: 'Habilitar streaming da resposta' })
    @IsBoolean()
    @IsOptional()
    stream?: boolean;
}

export class ConversationResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    messageCount: number;
}

export class MessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ['user', 'assistant', 'system'] })
    role: 'user' | 'assistant' | 'system';

    @ApiProperty()
    content: string;

    @ApiPropertyOptional()
    tokensUsed?: number;

    @ApiProperty()
    createdAt: Date;
}

export class ChatResponseDto {
    @ApiProperty()
    conversationId: string;

    @ApiProperty()
    message: MessageResponseDto;

    @ApiPropertyOptional({ description: 'Ações sugeridas pelo chatbot' })
    suggestedActions?: {
        type: string;
        label: string;
        payload: any;
    }[];

    @ApiPropertyOptional({ description: 'Custo estimado da requisição' })
    cost?: {
        inputTokens: number;
        outputTokens: number;
        totalCost: number;
    };
}

// ============================================
// Semantic Search DTOs
// ============================================

export class SemanticSearchDto {
    @ApiProperty({ description: 'Consulta em linguagem natural' })
    @IsString()
    query: string;

    @ApiPropertyOptional({ description: 'Tipos de documento para filtrar' })
    @IsArray()
    @IsOptional()
    documentTypes?: ('jurisprudence' | 'legislation' | 'case' | 'contract')[];

    @ApiPropertyOptional({ description: 'Tribunais para filtrar' })
    @IsArray()
    @IsOptional()
    tribunals?: ('STF' | 'STJ' | 'TRF1' | 'TRF2' | 'TRF3' | 'TRF4' | 'TRF5' | 'TJSP' | 'TJRJ' | 'TJMG')[];

    @ApiPropertyOptional({ description: 'Data inicial para filtrar' })
    @IsString()
    @IsOptional()
    dateFrom?: string;

    @ApiPropertyOptional({ description: 'Data final para filtrar' })
    @IsString()
    @IsOptional()
    dateTo?: string;

    @ApiPropertyOptional({ description: 'Número máximo de resultados', default: 10 })
    @IsNumber()
    @IsOptional()
    limit?: number;
}

export class SearchResultDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    documentType: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    similarity: number;

    @ApiPropertyOptional()
    metadata?: {
        tribunal?: string;
        date?: string;
        numero?: string;
        relator?: string;
        ementa?: string;
    };

    @ApiPropertyOptional()
    citation?: string; // Citação formatada (ABNT)
}

export class SearchResponseDto {
    @ApiProperty({ type: [SearchResultDto] })
    results: SearchResultDto[];

    @ApiProperty()
    totalResults: number;

    @ApiProperty()
    queryEmbeddingTime: number;

    @ApiProperty()
    searchTime: number;
}

// ============================================
// Document Indexing DTOs
// ============================================

export class IndexDocumentDto {
    @ApiProperty({ description: 'Conteúdo do documento' })
    @IsString()
    content: string;

    @ApiProperty({ enum: ['jurisprudence', 'legislation', 'case', 'contract'] })
    @IsEnum(['jurisprudence', 'legislation', 'case', 'contract'])
    documentType: 'jurisprudence' | 'legislation' | 'case' | 'contract';

    @ApiPropertyOptional({ description: 'ID do documento fonte (processo, contrato, etc.)' })
    @IsUUID()
    @IsOptional()
    sourceId?: string;

    @ApiPropertyOptional({ description: 'Metadados adicionais' })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class IndexResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    chunksCreated: number;

    @ApiProperty()
    embeddingsGenerated: number;

    @ApiProperty()
    processingTimeMs: number;
}
