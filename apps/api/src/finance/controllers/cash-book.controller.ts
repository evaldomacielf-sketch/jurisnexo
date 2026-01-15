import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { CreateCashBookEntryDto, UpdateCashBookEntryDto } from '../dto/cash-book.dto';
import { CashBookService } from '../services/cash-book.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../auth/decorators/current-tenant.decorator';
import { User as UserEntity } from '@supabase/supabase-js';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Finance - Cash Book')
@Controller('finance/cash-book')
@UseGuards(JwtAuthGuard)
export class CashBookController {
    constructor(private readonly service: CashBookService) { }

    @Post()
    @ApiOperation({ summary: 'Creates a new entry in the Digital Cash Book' })
    async createEntry(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Body() dto: CreateCashBookEntryDto) {
        return this.service.createEntry(tenantId, user.id, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Gets a specific entry' })
    async getEntry(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.service.getEntry(tenantId, id);
    }

    @Get()
    @ApiOperation({ summary: 'Lists entries with filters' })
    async listEntries(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Query('year') year: number,
        @Query('month') month?: number,
        @Query('fiscalCategory') fiscalCategory?: string,
        @Query('isDeductible') isDeductible?: string // Query params are strings
    ) {
        const isDeductibleBool = isDeductible === 'true' ? true : isDeductible === 'false' ? false : undefined;
        return this.service.listEntries(tenantId, year, month, fiscalCategory, isDeductibleBool);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Updates an entry' })
    async updateEntry(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCashBookEntryDto
    ) {
        return this.service.updateEntry(tenantId, user.id, id, dto);
    }

    @Get('report/:year')
    @ApiOperation({ summary: 'Generates full fiscal report for the year' })
    async generateAnnualReport(@CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string, @Param('year') year: number) {
        return this.service.generateAnnualReport(tenantId, year);
    }

    @Get('export/:year')
    @ApiOperation({ summary: 'Exports data to Excel (accountant format)' })
    async exportToExcel(
        @CurrentUser() user: UserEntity, @CurrentTenant() tenantId: string,
        @Param('year') year: number,
        @Query('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res: Response
    ) {
        const fileBuffer = await this.service.exportToExcel(tenantId, year, format);

        res.set({
            'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="livro-caixa-${year}.${format}"`,
            'Content-Length': fileBuffer.length,
        });

        res.end(fileBuffer);
    }

    @Get('categories/all') // changed path to avoid conflict with :id if not careful, though regex helps. 'categories' is safe if :id is uuid. 
    @ApiOperation({ summary: 'Gets available fiscal categories' })
    async getFiscalCategories() {
        return this.service.getFiscalCategories();
    }
}
