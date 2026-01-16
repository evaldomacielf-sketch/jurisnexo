-- Add slug to tenants if not exists
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS slug TEXT;
-- Populate slug with id (or a random string) for existing tenants to avoid unique constraint violations initially
-- In a real scenario, we might want to sanitize the name. For now, using ID as fallback.
UPDATE tenants
SET slug = id::text
WHERE slug IS NULL;
-- Enforce Uniqueness and Not Null
ALTER TABLE tenants
ALTER COLUMN slug
SET NOT NULL;
ALTER TABLE tenants
ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);