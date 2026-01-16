import { getAccessToken } from '@/lib/auth/cookies';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    let token: string | undefined;

    try {
        token = await getAccessToken();
    } catch (error) {
        console.error('Error getting access token:', error);
        // Continue without token for debugging
    }

    if (!token) {
        redirect('/login');
    }

    // Removed jsonwebtoken decode - was causing SSR issues
    // Token validation should happen in middleware or API

    return (
        <DashboardClient />
    );
}
