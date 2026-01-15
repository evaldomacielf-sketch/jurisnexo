import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService, MonthlySummary } from '../services/reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Finance - Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('finance/reports')
export class ReportsController {
    constructor(private readonly service: ReportsService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Obter resumo financeiro mensal' })
    @ApiQuery({ name: 'year', required: false, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    async getMonthlySummary(
        @Req() req: AuthenticatedRequest,
        @Query('year') year?: string,
        @Query('month') month?: string
    ): Promise<MonthlySummary> {
        const currentDate = new Date();
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;

        return this.service.getMonthlySummary(req.user.tenantId, targetYear, targetMonth);
    }
}
