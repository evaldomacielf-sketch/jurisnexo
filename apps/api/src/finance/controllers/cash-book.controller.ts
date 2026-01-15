import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { CreateCashBookEntryDto, UpdateCashBookEntryDto } from '../dto/cash-book.dto';
import { CashBookService } from '../services/cash-book.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
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
    async createEntry(@User() user: UserEntity, @Body() dto: CreateCashBookEntryDto) {
        return this.service.createEntry(user.app_metadata.tenant_id, user.id, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Gets a specific entry' })
    async getEntry(@User() user: UserEntity, @Param('id') id: string) {
        return this.service.getEntry(user.app_metadata.tenant_id, id);
    }

    @Get()
    @ApiOperation({ summary: 'Lists entries with filters' })
    async listEntries(
        @User() user: UserEntity,
        @Query('year') year: number,
        @Query('month') month?: number,
        @Query('fiscalCategory') fiscalCategory?: string,
        @Query('isDeductible') isDeductible?: string // Query params are strings
    ) {
        const isDeductibleBool = isDeductible === 'true' ? true : isDeductible === 'false' ? false : undefined;
        return this.service.listEntries(user.app_metadata.tenant_id, year, month, fiscalCategory, isDeductibleBool);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Updates an entry' })
    async updateEntry(
        @User() user: UserEntity,
        @Param('id') id: string,
        @Body() dto: UpdateCashBookEntryDto
    ) {
        return this.service.updateEntry(user.app_metadata.tenant_id, user.id, id, dto);
    }

    @Get('report/:year')
    @ApiOperation({ summary: 'Generates full fiscal report for the year' })
    async generateAnnualReport(@User() user: UserEntity, @Param('year') year: number) {
        return this.service.generateAnnualReport(user.app_metadata.tenant_id, year);
    }

    @Get('export/:year')
    @ApiOperation({ summary: 'Exports data to Excel (accountant format)' })
    async exportToExcel(
        @User() user: UserEntity,
        @Param('year') year: number,
        @Query('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res: Response
    ) {
        const fileBuffer = await this.service.exportToExcel(user.app_metadata.tenant_id, year, format);

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
