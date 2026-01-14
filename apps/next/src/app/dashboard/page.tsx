import { getAccessToken } from '@/lib/auth/cookies';
import { redirect } from 'next/navigation';
import { decode } from 'jsonwebtoken';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const token = await getAccessToken();

    if (!token) {
        redirect('/auth/login');
    }

    // Decode token (insecure parse, just for claims check)
    // Verify should ideally happen in middleware.
    const payload: any = decode(token);

    if (!payload || !payload.tenant_id) {
        // No tenant context
        // redirect('/tenants/select'); // Temporarily commented out to avoid loop if tenant flow is not ready
    }

    return (
        <DashboardClient />
    );
}
