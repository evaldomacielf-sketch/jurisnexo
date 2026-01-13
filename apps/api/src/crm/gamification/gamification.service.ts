import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class GamificationService {
    private readonly logger = new Logger(GamificationService.name);

    constructor(private readonly db: DatabaseService) { }

    async awardPoints(userId: string, points: number, _tenantId: string) {
        // 1. Get current points
        const { data: user } = await this.db.client.from('users').select('points, level').eq('id', userId).single();
        if (!user) return; // Should not happen

        const newPoints = (user.points || 0) + points;
        let newLevel = user.level || 1;

        // Level Up logic: Level = 1 + floor(points / 1000)
        const calculatedLevel = 1 + Math.floor(newPoints / 1000);
        if (calculatedLevel > newLevel) {
            newLevel = calculatedLevel;
            this.logger.log(`User ${userId} leveled up to ${newLevel}!`);
            // TODO: Notify user
        }

        // 2. Update User
        await this.db.client.from('users').update({ points: newPoints, level: newLevel }).eq('id', userId);

        // 3. Check Achievements triggers? 
        // Ideally we check achievements async or here based on total points.
        // For now, specific actions trigger specific checks.
    }

    async checkAchievements(userId: string, tenantId: string, type: 'MESSAGE_COUNT' | 'DEALS_CLOSED', currentValue: number) {
        // Find locked achievements for this type
        const { data: achievements } = await this.db.client
            .from('crm_achievements')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('condition_type', type)
            .lte('condition_value', currentValue); // Unlocked if condition met

        if (!achievements || achievements.length === 0) return;

        // Check which are already unlocked
        const { data: unlocked } = await this.db.client
            .from('crm_user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        const unlockedIds = new Set(unlocked?.map(u => u.achievement_id) || []);

        for (const achievement of achievements) {
            if (!unlockedIds.has(achievement.id)) {
                // Unlock!
                this.logger.log(`Unlocking achievement ${achievement.name} for user ${userId}`);
                await this.db.client.from('crm_user_achievements').insert({
                    tenant_id: tenantId,
                    user_id: userId,
                    achievement_id: achievement.id
                });

                // Award points for achievement?
                if (achievement.points > 0) {
                    await this.awardPoints(userId, achievement.points, tenantId);
                }
            }
        }
    }

    async getLeaderboard(tenantId: string) {
        const { data: users, error } = await this.db.client
            .from('users')
            .select('id, full_name, avatar_url, points, level')
            .eq('tenant_id', tenantId)
            .order('points', { ascending: false })
            .limit(10);

        if (error) throw new Error(error.message);
        return users;
    }
}
