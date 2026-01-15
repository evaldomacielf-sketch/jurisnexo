import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchService } from '../services/semantic-search.service';
import { SemanticSearchDto, SearchResponseDto, IndexDocumentDto, IndexResponseDto } from '../dto/ai.dto';

@ApiTags('AI Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Busca semântica em documentos jurídicos' })
    @ApiResponse({ status: 200, description: 'Resultados da busca', type: SearchResponseDto })
    async search(
        @Req() req: any,
        @Body() dto: SemanticSearchDto,
    ): Promise<SearchResponseDto> {
        return this.searchService.hybridSearch(req.user.tenantId, dto);
    }

    @Post('jurisprudencia')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Busca especializada em jurisprudência' })
    @ApiResponse({ status: 200, description: 'Resultados de jurisprudência' })
    async searchJurisprudence(
        @Req() req: any,
        @Body() dto: SemanticSearchDto,
    ): Promise<SearchResponseDto> {
        // Force document type to jurisprudence
        dto.documentTypes = ['jurisprudence'];
        return this.searchService.hybridSearch(req.user.tenantId, dto);
    }

    @Post('legislacao')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Busca em legislação' })
    @ApiResponse({ status: 200, description: 'Resultados de legislação' })
    async searchLegislation(
        @Req() req: any,
        @Body() dto: SemanticSearchDto,
    ): Promise<SearchResponseDto> {
        dto.documentTypes = ['legislation'];
        return this.searchService.hybridSearch(req.user.tenantId, dto);
    }

    @Post('documents/index')
    @ApiOperation({ summary: 'Indexar documento para busca semântica' })
    @ApiResponse({ status: 201, description: 'Documento indexado', type: IndexResponseDto })
    async indexDocument(
        @Req() req: any,
        @Body() dto: IndexDocumentDto,
    ): Promise<IndexResponseDto> {
        return this.searchService.indexDocument(req.user.tenantId, dto);
    }

    @Delete('documents/:sourceId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover documento do índice' })
    @ApiResponse({ status: 204, description: 'Documento removido' })
    async deleteDocumentIndex(
        @Param('sourceId') sourceId: string,
    ): Promise<void> {
        return this.searchService.deleteDocumentEmbeddings(sourceId);
    }
}
