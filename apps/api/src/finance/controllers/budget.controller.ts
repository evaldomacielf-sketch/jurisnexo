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
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BudgetService } from '../services/budget.service';
import { CreateBudgetDto, UpdateBudgetDto, BudgetResponseDto } from '../dto/budget.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/budgets')
export class BudgetController {
    constructor(private readonly service: BudgetService) { }

    @Post()
    @ApiOperation({ summary: 'Criar orçamento mensal' })
    @ApiResponse({ status: 201, description: 'Orçamento criado', type: BudgetResponseDto })
    async create(
        @Body() dto: CreateBudgetDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BudgetResponseDto> {
        return this.service.create(req.user.tenantId, dto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar orçamentos por período' })
    @ApiQuery({ name: 'year', required: false, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Lista de orçamentos', type: [BudgetResponseDto] })
    async findAll(
        @Req() req: AuthenticatedRequest,
        @Query('year') year?: string,
        @Query('month') month?: string
    ): Promise<BudgetResponseDto[]> {
        return this.service.findAll(
            req.user.tenantId,
            year ? parseInt(year) : undefined,
            month ? parseInt(month) : undefined
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar orçamento por ID' })
    @ApiResponse({ status: 200, description: 'Orçamento encontrado', type: BudgetResponseDto })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<BudgetResponseDto> {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar orçamento' })
    @ApiResponse({ status: 200, description: 'Orçamento atualizado', type: BudgetResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateBudgetDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BudgetResponseDto> {
        return this.service.update(req.user.tenantId, id, dto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir orçamento' })
    @ApiResponse({ status: 204, description: 'Orçamento excluído' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<void> {
        return this.service.remove(req.user.tenantId, id, req.user.id);
    }
}
