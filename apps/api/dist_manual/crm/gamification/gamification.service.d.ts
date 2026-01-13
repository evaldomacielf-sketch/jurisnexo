import { DatabaseService } from '../../database/database.service';
export declare class GamificationService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    awardPoints(userId: string, points: number, _tenantId: string): Promise<void>;
    checkAchievements(userId: string, tenantId: string, type: 'MESSAGE_COUNT' | 'DEALS_CLOSED', currentValue: number): Promise<void>;
    getLeaderboard(tenantId: string): Promise<{
        id: any;
        full_name: any;
        avatar_url: any;
        points: any;
        level: any;
    }[]>;
}
//# sourceMappingURL=gamification.service.d.ts.map