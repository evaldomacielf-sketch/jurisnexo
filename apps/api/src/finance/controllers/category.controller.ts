import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '../dto/category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova categoria' })
    @ApiResponse({ status: 201, description: 'Categoria criada', type: CategoryResponseDto })
    @ApiResponse({ status: 400, description: 'Categoria já existe' })
    async create(
        @Body() dto: CreateCategoryDto,
        @Req() req: AuthenticatedRequest
    ): Promise<CategoryResponseDto> {
        return this.categoryService.create(
            req.user.tenantId,
            dto,
            req.user.id
        );
    }

    @Post('seed-defaults')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar categorias padrão para o tenant' })
    @ApiResponse({ status: 201, description: 'Categorias padrão criadas' })
    async seedDefaults(@Req() req: AuthenticatedRequest): Promise<{ message: string }> {
        await this.categoryService.seedDefaultCategories(
            req.user.tenantId,
            req.user.id
        );
        return { message: 'Categorias padrão criadas com sucesso' };
    }

    @Get()
    @ApiOperation({ summary: 'Listar categorias' })
    @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE'], description: 'Filtrar por tipo' })
    @ApiResponse({ status: 200, description: 'Lista de categorias', type: [CategoryResponseDto] })
    async findAll(
        @Req() req: AuthenticatedRequest,
        @Query('type') type?: string
    ): Promise<CategoryResponseDto[]> {
        return this.categoryService.findAll(req.user.tenantId, type);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Estatísticas de uso por categoria' })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
    @ApiResponse({ status: 200, description: 'Estatísticas por categoria' })
    async getStats(
        @Req() req: AuthenticatedRequest,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.categoryService.getCategoryStats(
            req.user.tenantId,
            startDate,
            endDate
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar categoria específica' })
    @ApiResponse({ status: 200, description: 'Categoria encontrada', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<CategoryResponseDto> {
        return this.categoryService.findOne(req.user.tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar categoria' })
    @ApiResponse({ status: 200, description: 'Categoria atualizada', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateCategoryDto,
        @Req() req: AuthenticatedRequest
    ): Promise<CategoryResponseDto> {
        return this.categoryService.update(
            req.user.tenantId,
            id,
            dto,
            req.user.id
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir categoria' })
    @ApiResponse({ status: 204, description: 'Categoria excluída' })
    @ApiResponse({ status: 400, description: 'Categoria possui transações vinculadas' })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<void> {
        return this.categoryService.remove(
            req.user.tenantId,
            id,
            req.user.id
        );
    }
}
