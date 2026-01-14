import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../auth.guard';

@Controller('schedule')
@UseGuards(AuthGuard)
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.scheduleService.findAll(req.user.tenant_id);
    }
}
