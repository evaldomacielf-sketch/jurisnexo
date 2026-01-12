import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decode } from 'jsonwebtoken';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        redirect('/auth/login');
    }

    // Decode token (insecure parse, just for claims check)
    // Verify should ideally happen in middleware.
    const payload: any = decode(token);

    if (!payload || !payload.tenant_id) {
        // No tenant context
        redirect('/tenants/select');
    }

    return (
        <DashboardClient />
    );
}
