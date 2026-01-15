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
import { RecurringTransactionService } from '../services/recurring-transaction.service';
import { CreateRecurringTransactionDto, UpdateRecurringTransactionDto, RecurringTransactionResponseDto } from '../dto/recurring-transaction.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Recurring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/recurring')
export class RecurringTransactionController {
    constructor(private readonly service: RecurringTransactionService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova recorrência' })
    @ApiResponse({ status: 201, description: 'Recorrência criada', type: RecurringTransactionResponseDto })
    async create(
        @Body() dto: CreateRecurringTransactionDto,
        @Req() req: AuthenticatedRequest
    ): Promise<RecurringTransactionResponseDto> {
        return this.service.create(req.user.tenantId, dto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar recorrências' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Lista de recorrências', type: [RecurringTransactionResponseDto] })
    async findAll(
        @Query('isActive') isActive?: string,
        @Req() req: AuthenticatedRequest
    ): Promise<RecurringTransactionResponseDto[]> {
        const activeFilter = isActive === undefined ? undefined : isActive === 'true';
        return this.service.findAll(req.user.tenantId, activeFilter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar recorrência por ID' })
    @ApiResponse({ status: 200, description: 'Recorrência encontrada', type: RecurringTransactionResponseDto })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<RecurringTransactionResponseDto> {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar recorrência' })
    @ApiResponse({ status: 200, description: 'Recorrência atualizada', type: RecurringTransactionResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateRecurringTransactionDto,
        @Req() req: AuthenticatedRequest
    ): Promise<RecurringTransactionResponseDto> {
        return this.service.update(req.user.tenantId, id, dto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir recorrência' })
    @ApiResponse({ status: 204, description: 'Recorrência excluída' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest
    ): Promise<void> {
        return this.service.remove(req.user.tenantId, id, req.user.id);
    }
}
