import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getLeaderboard(req: any): Promise<{
        id: any;
        full_name: any;
        avatar_url: any;
        points: any;
        level: any;
    }[]>;
}
//# sourceMappingURL=gamification.controller.d.ts.map