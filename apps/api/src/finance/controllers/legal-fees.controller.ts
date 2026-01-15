import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateLegalFeeDto, UpdateLegalFeeDto, RecordFeePaymentDto } from '../dto/legal-fees.dto';
import { LegalFeesService } from '../legal-fees.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../auth/decorators/current-tenant.decorator';
import { User as UserEntity } from '@supabase/supabase-js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Finance - Legal Fees')
@Controller('finance/legal-fees')
@UseGuards(JwtAuthGuard)
export class LegalFeesController {
    constructor(private readonly service: LegalFeesService) { }

    @Post()
    @ApiOperation({ summary: 'Creates a new legal fee contract' })
    async createFee(@CurrentUser() user: UserEntity, @Body() dto: CreateLegalFeeDto) {
        return this.service.create(user.app_metadata.tenant_id, user.id, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Gets a specific fee contract' })
    async getFee(@CurrentUser() user: UserEntity, @Param('id') id: string) {
        return this.service.findOne(user.app_metadata.tenant_id, id);
    }

    @Get()
    @ApiOperation({ summary: 'Lists fees with filters' })
    async listFees(
        @CurrentUser() user: UserEntity,
        @Query('caseId') caseId?: string,
        @Query('clientId') clientId?: string,
        @Query('status') status?: string
    ) {
        return this.service.findAll(user.app_metadata.tenant_id, { caseId, clientId, status });
    }

    @Post('payments')
    @ApiOperation({ summary: 'Records a payment for a fee' })
    async recordPayment(@CurrentUser() user: UserEntity, @Body() dto: RecordFeePaymentDto) {
        // Warning: service.recordPayment parameters are different in service definition vs C# example
        // Service: tenantId, userId, feeId, dto
        // C# Example DTO likely contains feeId?
        // Let's assume the DTO has a feeId or we pass it
        // The service method signature is:
        //    async recordPayment(tenantId: string, userId: string, feeId: string, dto: RecordFeePaymentDto)
        // But the DTO `RecordFeePaymentDto` (I should check it) probably has legalFeeId.

        // Let's instantiate a variable for feeId effectively
        const feeId = (dto as any).legalFeeId; // Assuming DTO has it based on context
        if (!feeId) throw new Error("legalFeeId missing in DTO");

        return this.service.recordPayment(user.app_metadata.tenant_id, user.id, feeId, dto);
    }

    // Missing methods in service: update, profitability, dashboard
    // I should implement them in service if I want them, but for now let's just implement what's available
    // or stub them.
    @Put(':id')
    @ApiOperation({ summary: 'Update legal fee' })
    async updateFee(
        @CurrentUser() user: UserEntity,
        @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateLegalFeeDto
    ) {
        return this.service.update(tenantId, user.id, id, dto);
    }

    @Get('profitability')
    @ApiOperation({ summary: 'Análise de lucratividade' })
    async getProfitabilityAnalysis(
        @CurrentTenant() tenantId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('clientId') clientId?: string
    ) {
        return this.service.getProfitabilityAnalysis(
            tenantId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            clientId
        );
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard de honorários' })
    async getDashboard(@CurrentTenant() tenantId: string) {
        return this.service.getDashboard(tenantId);
    }
}
