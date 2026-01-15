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
import { TransactionService } from '../services/transaction.service';
import {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionFilterDto,
    TransactionResponseDto,
} from '../dto/transaction.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova transação' })
    @ApiResponse({ status: 201, description: 'Transação criada', type: TransactionResponseDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async create(
        @Body() dto: CreateTransactionDto,
        @Req() req: AuthenticatedRequest
    ): Promise<TransactionResponseDto> {
        return this.transactionService.create(
            req.user.tenantId,
            dto,
            req.user.id
        );
    }

    @Get()
    @ApiOperation({ summary: 'Listar transações com filtros' })
    @ApiResponse({ status: 200, description: 'Lista de transações paginada' })
    async findAll(
        @Query() filterDto: TransactionFilterDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.transactionService.findAll(req.user.tenantId, filterDto);
    }

    @Get('stats/monthly')
    @ApiOperation({ summary: 'Obter estatísticas mensais' })
    @ApiQuery({ name: 'year', type: Number, example: 2024 })
    @ApiQuery({ name: 'month', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Estatísticas do mês' })
    async getMonthlyStats(
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
        @Req() req: AuthenticatedRequest
    ) {
        return this.transactionService.getMonthlyStats(req.user.tenantId, year, month);
    }

    @Get('stats/by-category')
    @ApiOperation({ summary: 'Transações agrupadas por categoria' })
    @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'Transações por categoria' })
    async getByCategory(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.transactionService.getByCategory(req.user.tenantId, startDate, endDate);
    }

    @Get('stats/cash-flow')
    @ApiOperation({ summary: 'Fluxo de caixa diário' })
    @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'Fluxo de caixa diário' })
    async getDailyCashFlow(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.transactionService.getDailyCashFlow(req.user.tenantId, startDate, endDate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar transação específica' })
    @ApiResponse({ status: 200, description: 'Transação encontrada', type: TransactionResponseDto })
    @ApiResponse({ status: 404, description: 'Transação não encontrada' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<TransactionResponseDto> {
        return this.transactionService.findOne(req.user.tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar transação' })
    @ApiResponse({ status: 200, description: 'Transação atualizada', type: TransactionResponseDto })
    @ApiResponse({ status: 404, description: 'Transação não encontrada' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTransactionDto,
        @Req() req: AuthenticatedRequest
    ): Promise<TransactionResponseDto> {
        return this.transactionService.update(
            req.user.tenantId,
            id,
            dto,
            req.user.id
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir transação' })
    @ApiResponse({ status: 204, description: 'Transação excluída' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<void> {
        return this.transactionService.remove(
            req.user.tenantId,
            id,
            req.user.id
        );
    }
}
