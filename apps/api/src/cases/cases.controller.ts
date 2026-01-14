import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CasesController {
    constructor(private readonly casesService: CasesService) { }

    @Post()
    create(@Request() req: any, @Body() createCaseDto: CreateCaseDto) {
        return this.casesService.create(createCaseDto, req.user.tenantId);
    }

    @Get()
    findAll(
        @Request() req: any,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.casesService.findAll(req.user.tenantId, { status, search });
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.casesService.findOne(id, req.user.tenantId);
    }

    @Patch(':id')
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateCaseDto: Partial<CreateCaseDto>,
    ) {
        return this.casesService.update(id, updateCaseDto, req.user.tenantId);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.casesService.remove(id, req.user.tenantId);
    }
}
