import { Controller, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AuthGuard } from '../../auth.guard';

@Controller('crm/gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @UseGuards(AuthGuard)
    @Get('leaderboard')
    async getLeaderboard(@Request() req: any) {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) throw new BadRequestException('No active tenant context');

        return this.gamificationService.getLeaderboard(tenantId);
    }
}
