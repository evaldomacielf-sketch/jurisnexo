/*
 Migration: 004_refresh_tokens.sql
 Description: Store opaque refresh tokens for custom auth flow.
 */
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    replaced_by_token TEXT
);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "refresh_tokens_own" ON refresh_tokens FOR ALL USING (user_id = auth.uid());