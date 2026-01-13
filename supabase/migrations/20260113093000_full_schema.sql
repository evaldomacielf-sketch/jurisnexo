-- Schema principal do JurisNexo (PostgreSQL via Supabase)
-- 1. TENANTS (Multi-tenancy)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'trial',
    -- trial, pro, enterprise
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- active, suspended, cancelled
    trial_ends_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- 2. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    -- owner, admin, member
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
-- 3. CONTACTS (CRM)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    tags TEXT [],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, phone)
);
-- 4. CASES (Casos Jurídicos)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE
    SET NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'new',
        -- new, in_progress, waiting, closed
        priority VARCHAR(20) DEFAULT 'medium',
        -- low, medium, high, urgent
        area_of_law VARCHAR(100),
        -- Área do direito
        assigned_to UUID REFERENCES users(id) ON DELETE
    SET NULL,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
-- 5. CONVERSATIONS (WhatsApp)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE
    SET NULL,
        phone_number_id VARCHAR(50) NOT NULL,
        -- WhatsApp Business Phone Number ID
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        -- open, closed, archived
        last_message_at TIMESTAMP,
        unread_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
-- 6. MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(100) UNIQUE,
    direction VARCHAR(10) NOT NULL,
    -- inbound, outbound
    type VARCHAR(20) NOT NULL DEFAULT 'text',
    -- text, image, document, audio, video
    content TEXT,
    media_url TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    -- sent, delivered, read, failed
    sent_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
-- 7. REFERRALS (Encaminhamentos)
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    partner_id UUID,
    -- ID do parceiro (futuro: tabela partners)
    status VARCHAR(30) NOT NULL DEFAULT 'pending_consent',
    -- pending_consent, consent_given, consent_denied, referred, completed
    consent_given_at TIMESTAMP,
    referred_at TIMESTAMP,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- 8. APPOINTMENTS (Agendamentos)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    meet_link TEXT,
    google_event_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    -- scheduled, confirmed, cancelled, completed
    confirmed_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- 9. KEYWORDS (Plantão AI)
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    -- alert, auto_assign, flag
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, keyword)
);
-- 10. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    -- message, case_update, appointment, referral
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- ÍNDICES para Performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_cases_tenant ON cases(tenant_id);
CREATE INDEX idx_cases_contact ON cases(contact_id);
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_referrals_tenant ON referrals(tenant_id);
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
-- ROW LEVEL SECURITY (Multi-tenancy)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- Políticas RLS (exemplo para contacts)
CREATE POLICY "Users can only see contacts from their tenant" ON contacts FOR
SELECT USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
    );
CREATE POLICY "Users can only insert contacts in their tenant" ON contacts FOR
INSERT WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id')::UUID
    );