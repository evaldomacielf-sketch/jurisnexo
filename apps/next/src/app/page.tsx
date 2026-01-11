import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { appConfig } from '@jurisnexo/config';

export default async function Home() {
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Redirect based on host
    if (host.includes(appConfig.hosts.app)) {
        redirect('/app/dashboard');
    } else if (host.includes(appConfig.hosts.auth)) {
        redirect('/auth/login');
    } else {
        redirect('/site');
    }
}
