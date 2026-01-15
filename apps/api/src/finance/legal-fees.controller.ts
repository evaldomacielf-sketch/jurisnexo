import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LegalFeesService } from './legal-fees.service';
import { CreateLegalFeeDto, RecordFeePaymentDto } from './dto/legal-fees.dto';

@ApiTags('Legal Fees')
@Controller('finance/legal-fees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LegalFeesController {
    constructor(private readonly legalFeesService: LegalFeesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new legal fee contract' })
    create(@Request() req, @Body() dto: CreateLegalFeeDto) {
        return this.legalFeesService.create(req.user.tenantId, req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List legal fees' })
    @ApiQuery({ name: 'clientId', required: false })
    @ApiQuery({ name: 'caseId', required: false })
    @ApiQuery({ name: 'status', required: false })
    findAll(
        @Request() req,
        @Query('clientId') clientId?: string,
        @Query('caseId') caseId?: string,
        @Query('status') status?: string,
    ) {
        return this.legalFeesService.findAll(req.user.tenantId, { clientId, caseId, status });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of a legal fee' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.legalFeesService.findOne(req.user.tenantId, id);
    }

    @Post(':id/payments')
    @ApiOperation({ summary: 'Record a payment for a legal fee' })
    recordPayment(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: RecordFeePaymentDto,
    ) {
        return this.legalFeesService.recordPayment(req.user.tenantId, req.user.id, id, dto);
    }
}
