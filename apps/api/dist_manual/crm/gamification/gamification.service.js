"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GamificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let GamificationService = GamificationService_1 = class GamificationService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(GamificationService_1.name);
    }
    async awardPoints(userId, points, _tenantId) {
        // 1. Get current points
        const { data: user } = await this.db.client.from('users').select('points, level').eq('id', userId).single();
        if (!user)
            return; // Should not happen
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
    async checkAchievements(userId, tenantId, type, currentValue) {
        // Find locked achievements for this type
        const { data: achievements } = await this.db.client
            .from('crm_achievements')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('condition_type', type)
            .lte('condition_value', currentValue); // Unlocked if condition met
        if (!achievements || achievements.length === 0)
            return;
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
    async getLeaderboard(tenantId) {
        const { data: users, error } = await this.db.client
            .from('users')
            .select('id, full_name, avatar_url, points, level')
            .eq('tenant_id', tenantId)
            .order('points', { ascending: false })
            .limit(10);
        if (error)
            throw new Error(error.message);
        return users;
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = GamificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map