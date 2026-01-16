-- Add points and level to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
-- Achievements Table (Defines available badges)
CREATE TABLE crm_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    -- URL or icon name
    points INT DEFAULT 10,
    condition_type TEXT NOT NULL,
    -- MESSAGE_COUNT, DEALS_CLOSED, etc.
    condition_value INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- User Achievements (Unlocked badges)
CREATE TABLE crm_user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES crm_achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);
-- Indexes
CREATE INDEX idx_crm_achievements_tenant ON crm_achievements(tenant_id);
CREATE INDEX idx_crm_user_achievements_user ON crm_user_achievements(user_id);
-- RLS
ALTER TABLE crm_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_user_achievements ENABLE ROW LEVEL SECURITY;
-- Policies:
-- Achievements: Read all in tenant, Write only admin (or system via admin client)
CREATE POLICY "achievements_select" ON crm_achievements FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
-- User Achievements: Read all in tenant (for leaderboard), Insert only system/admin
CREATE POLICY "user_achievements_select" ON crm_user_achievements FOR
SELECT USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);