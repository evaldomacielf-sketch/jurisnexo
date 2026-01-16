-- Migration: WhatsApp Module Tables
-- Description: Creates tables for WhatsApp integration
-- 1. WhatsApp Contacts
create table public.whatsapp_contacts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id),
    name text not null,
    phone text not null,
    wa_id text,
    -- WhatsApp ID specific
    email text,
    profile_pic_url text,
    is_blocked boolean default false,
    tags jsonb default '[]'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.whatsapp_contacts enable row level security;
create policy "Users can view whatsapp_contacts of their tenant" on public.whatsapp_contacts for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can insert whatsapp_contacts of their tenant" on public.whatsapp_contacts for
insert with check (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can update whatsapp_contacts of their tenant" on public.whatsapp_contacts for
update using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
-- 2. WhatsApp Conversations
create table public.whatsapp_conversations (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id),
    contact_id uuid references public.whatsapp_contacts(id),
    -- Or link to generic contacts? User req says "whatsapp_conversations"
    -- User requested mapping to "users (clientes)" -> assuming internal users acting as customers or contacts?
    -- Usually "contacts" table. The user req says "Relacionamento com users (clientes)". 
    -- In JurisNexo, "Contact" is the person. "User" is the system user (Lawyer).
    -- I will link to 'contacts' usually, but let's stick to the requested structure if implied.
    -- "Relacionamento com users (clientes)" -> maybe `customer_id` referencing `users` if they are portal users?
    -- Or `contact_id` referencing `contacts`. I'll use `whatsapp_contacts` created above or generic `contacts`.
    -- Let's use `whatsapp_contacts` for Whatsapp specific identity, which might link to `contacts`.
    assigned_to_user_id uuid references public.users(id),
    case_id uuid references public.cases(id),
    whatsapp_id text,
    -- Conversation ID from WA
    customer_phone text not null,
    customer_name text,
    last_message text,
    last_message_at timestamptz,
    unread_count integer default 0,
    session_status text default 'Active',
    -- Active, Expired, Closed
    session_expires_at timestamptz,
    is_archived boolean default false,
    is_muted boolean default false,
    is_bot_enabled boolean default true,
    tags_json text,
    -- or jsonb
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.whatsapp_conversations enable row level security;
create policy "Users can view whatsapp_conversations of their tenant" on public.whatsapp_conversations for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can insert whatsapp_conversations of their tenant" on public.whatsapp_conversations for
insert with check (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can update whatsapp_conversations of their tenant" on public.whatsapp_conversations for
update using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
-- 3. WhatsApp Messages
create table public.whatsapp_messages (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id),
    conversation_id uuid not null references public.whatsapp_conversations(id),
    whatsapp_message_id text,
    direction text not null,
    -- Inbound, Outbound
    type text not null,
    -- text, image, etc.
    content text,
    media_url text,
    media_type text,
    metadata_json jsonb,
    status text default 'Sent',
    -- sent, delivered, read, failed
    sent_at timestamptz default now(),
    delivered_at timestamptz,
    read_at timestamptz,
    created_at timestamptz default now()
);
alter table public.whatsapp_messages enable row level security;
create policy "Users can view whatsapp_messages of their tenant" on public.whatsapp_messages for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can insert whatsapp_messages of their tenant" on public.whatsapp_messages for
insert with check (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
create policy "Users can update whatsapp_messages of their tenant" on public.whatsapp_messages for
update using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
-- 4. WhatsApp Templates
create table public.whatsapp_templates (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id),
    name text not null,
    category text,
    language text default 'pt_BR',
    content text,
    components_json jsonb,
    status text default 'Pending',
    -- Pending, Approved, Rejected
    external_id text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.whatsapp_templates enable row level security;
create policy "Users can view whatsapp_templates of their tenant" on public.whatsapp_templates for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
-- 5. WhatsApp Media
create table public.whatsapp_media (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id),
    message_id uuid references public.whatsapp_messages(id),
    file_name text,
    mime_type text,
    size_bytes bigint,
    storage_path text,
    public_url text,
    message_type text,
    -- image, video, document
    created_at timestamptz default now()
);
alter table public.whatsapp_media enable row level security;
create policy "Users can view whatsapp_media of their tenant" on public.whatsapp_media for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );
-- 6. WhatsApp Webhook Logs
create table public.whatsapp_webhook_logs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid references public.tenants(id),
    -- Nullable if tenant not identified yet
    provider text,
    -- Meta, Twilio
    payload jsonb,
    processed boolean default false,
    error_message text,
    created_at timestamptz default now()
);
alter table public.whatsapp_webhook_logs enable row level security;
create policy "Users can view whatsapp_webhook_logs of their tenant" on public.whatsapp_webhook_logs for
select using (
        tenant_id = (
            select auth.jwt()->>'tenant_id'
        )::uuid
    );