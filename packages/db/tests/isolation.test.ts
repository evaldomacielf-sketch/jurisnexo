import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';


// Mock client or use real one if env vars present
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';

// Admin client for setup
const adminClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});

// Helpers to create auth users
async function createUser(email: string) {
    const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
    });
    if (error) throw error;
    return data.user;
}

// Helper to get client as user
async function getClientAsUser(email: string) {
    const { data } = await adminClient.auth.signInWithPassword({
        email,
        password: 'password123',
    });
    return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || 'anon-key', {
        global: { headers: { Authorization: `Bearer ${data.session?.access_token}` } },
        auth: { persistSession: false },
    });
}

describe('Multi-Tenant Isolation & Security', () => {
    let userA: any;
    let userB: any;
    let tenantA: any;
    let tenantB: any;

    beforeAll(async () => {
        // 1. Setup Data
        userA = await createUser(`userA_${Date.now()}@test.com`);
        userB = await createUser(`userB_${Date.now()}@test.com`);

        // Create Tenants
        const { data: tA } = await adminClient.from('tenants').insert({
            name: 'Tenant A',
            slug: `tenant-a-${Date.now()}`
        }).select().single();
        tenantA = tA;

        const { data: tB } = await adminClient.from('tenants').insert({
            name: 'Tenant B',
            slug: `tenant-b-${Date.now()}`
        }).select().single();
        tenantB = tB;

        // Link Memberships (User A -> Tenant A, User B -> Tenant B)
        await adminClient.from('memberships').insert([
            { tenant_id: tenantA.id, user_id: userA.id, role: 'owner' },
            { tenant_id: tenantB.id, user_id: userB.id, role: 'owner' }
        ]);

        // Create User Preferences (via RLS, acting as users)
        // Needs policy to allow insert. 003 has "user_preferences_own".
    });

    describe('Tenant Branding Isolation', () => {
        it('Tenant A cannot see Tenant B branding', async () => {
            const clientA = await getClientAsUser(userA.email);
            const clientB = await getClientAsUser(userB.email);

            // A sets branding
            await clientA.from('tenant_branding').insert({
                tenant_id: tenantA.id,
                primary_color: '#000000'
            });

            // B tries to read A's branding
            const { data, error } = await clientB
                .from('tenant_branding')
                .select('*')
                .eq('tenant_id', tenantA.id); // Valid query, but RLS should filter

            // Should be empty array, not error (RLS hides rows)
            expect(error).toBeNull();
            expect(data).toHaveLength(0);
        });

        it('Tenant B cannot update Tenant A branding', async () => {
            const clientB = await getClientAsUser(userB.email);

            await clientB
                .from('tenant_branding')
                .update({ primary_color: '#FFFFFF' })
                .eq('tenant_id', tenantA.id);

            // RLS policy for UPDATE uses `using (tenant_id = jwt->tenant_id)`
            // Matches 0 rows, so no error, but no update.
            // Or if checking `with check`, it might verify.
            // Usually returns no error but count 0.

            // To verify it didn't update, check as A or Admin
            const { data } = await adminClient
                .from('tenant_branding')
                .select('*')
                .eq('tenant_id', tenantA.id)
                .single();

            expect(data.primary_color).toBe('#000000'); // Unchanged
        });
    });

    describe('Audit Events Append-Only', () => {
        it('Allows insertion of audit event', async () => {
            const clientA = await getClientAsUser(userA.email);

            const { error } = await clientA.from('audit_events').insert({
                tenant_id: tenantA.id,
                event_type: 'TEST_ACTION',
                resource_type: 'test',
                metadata: { foo: 'bar' }
            });

            expect(error).toBeNull();
        });

        it('Forbids UPDATE on audit events', async () => {
            const clientA = await getClientAsUser(userA.email);

            // Get an event ID
            const { data: event } = await clientA
                .from('audit_events')
                .select()
                .eq('tenant_id', tenantA.id)
                .limit(1)
                .single();

            if (!event) throw new Error('No event found');

            await clientA
                .from('audit_events')
                .update({ event_type: 'MODIFIED' })
                .eq('id', event.id);

            // Supabase RLS throws error if no policy allows the action, 
            // OR silently ignores.
            // If NO policy for UPDATE exists (default deny), it throws error usually?
            // Actually standard PG RLS with no policy means empty set for UPDATE USING, so 0 updated.
            // If we want ERROR, we need a policy that returns (false) or just rely on 0 rows.
            // But let's assume valid append-only behavior: Data remains unchanged.

            const { data: check } = await adminClient
                .from('audit_events')
                .select()
                .eq('id', event.id)
                .single();

            expect(check.event_type).toBe('TEST_ACTION');
        });

        it('Forbids DELETE on audit events', async () => {
            const clientA = await getClientAsUser(userA.email);

            const { data: event } = await clientA
                .from('audit_events')
                .select()
                .limit(1)
                .single();

            await clientA
                .from('audit_events')
                .delete()
                .eq('id', event.id);

            // Should delete 0 rows
            const { data: check } = await adminClient
                .from('audit_events')
                .select()
                .eq('id', event.id)
                .single();

            expect(check).not.toBeNull();
        });
    });
});
