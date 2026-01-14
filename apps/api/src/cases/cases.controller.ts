import { Controller, Get, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cases')
@UseGuards(AuthGuard)
export class CasesController {
    constructor(private readonly casesService: CasesService) { }

    @Get('kanban')
    getKanbanData() {
        return this.casesService.getKanbanData();
    }
}
