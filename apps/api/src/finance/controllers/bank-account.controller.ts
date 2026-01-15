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
import { BankAccountService } from '../services/bank-account.service';
import { CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto } from '../dto/bank-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/accounts')
export class BankAccountController {
    constructor(private readonly bankAccountService: BankAccountService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova conta bancária' })
    @ApiResponse({ status: 201, description: 'Conta criada com sucesso', type: BankAccountResponseDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou conta já existe' })
    async create(
        @Body() dto: CreateBankAccountDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountService.create(
            req.user.tenantId,
            dto,
            req.user.id
        );
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as contas bancárias' })
    @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Incluir contas inativas' })
    @ApiResponse({ status: 200, description: 'Lista de contas', type: [BankAccountResponseDto] })
    async findAll(
        @Req() req: AuthenticatedRequest,
        @Query('includeInactive') includeInactive?: string
    ): Promise<BankAccountResponseDto[]> {
        return this.bankAccountService.findAll(
            req.user.tenantId,
            includeInactive === 'true'
        );
    }

    @Get('balance')
    @ApiOperation({ summary: 'Obter saldo consolidado de todas as contas' })
    @ApiResponse({ status: 200, description: 'Saldo consolidado' })
    async getConsolidatedBalance(@Req() req: AuthenticatedRequest) {
        return this.bankAccountService.getConsolidatedBalance(req.user.tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar conta específica por ID' })
    @ApiResponse({ status: 200, description: 'Conta encontrada', type: BankAccountResponseDto })
    @ApiResponse({ status: 404, description: 'Conta não encontrada' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountService.findOne(req.user.tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar conta bancária' })
    @ApiResponse({ status: 200, description: 'Conta atualizada', type: BankAccountResponseDto })
    @ApiResponse({ status: 404, description: 'Conta não encontrada' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateBankAccountDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BankAccountResponseDto> {
        return this.bankAccountService.update(
            req.user.tenantId,
            id,
            dto,
            req.user.id
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir conta bancária' })
    @ApiResponse({ status: 204, description: 'Conta excluída com sucesso' })
    @ApiResponse({ status: 400, description: 'Conta possui transações vinculadas' })
    @ApiResponse({ status: 404, description: 'Conta não encontrada' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<void> {
        return this.bankAccountService.remove(
            req.user.tenantId,
            id,
            req.user.id
        );
    }
}
