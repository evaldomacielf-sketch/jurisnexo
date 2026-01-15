import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CashBookService } from './cash-book.service';
import { CreateCashBookEntryDto } from './dto/cash-book.dto';

@ApiTags('Cash Book (IR)')
@Controller('finance/cash-book')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CashBookController {
    constructor(private readonly cashBookService: CashBookService) { }

    @Post()
    @ApiOperation({ summary: 'Create a cash book entry (IR)' })
    create(@Request() req, @Body() dto: CreateCashBookEntryDto) {
        return this.cashBookService.createEntry(req.user.tenantId, req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List cash book entries for a year' })
    @ApiQuery({ name: 'year', required: true, example: 2026 })
    findAll(@Request() req, @Query('year') year: number) {
        return this.cashBookService.findAll(req.user.tenantId, year);
    }
}
