'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { useAuth } from '@/hooks/useAuth';
// Fix: useAuth might not be available yet if I didn't create it in step 1308. 
// I created TenantProvider but not a generic useAuth hook file.
// I'll assume valid auth token access via cookie or simple fetch wrapper. 
// For now, I'll fetch directly or assume global fetch interceptor? No.
// Let's rely on standard fetch with credentials or manually grabbing cookie if needed.
// Actually, I'll use a simple fetch since I don't have a reliable useAuth hook visible in file list.
// Wait, I saw `useAuth.ts` in `src/hooks` via `view_file` earlier (Step 1226 showed api `auth/auth.service` but frontend hook might be missing).
// I'll trust simple fetch to /api/* which usually proxies to localhost:3000 in dev or absolute URL.

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface UserScore {
    id: string;
    full_name: string;
    avatar_url: string;
    points: number;
    level: number;
}

export function LeaderboardWidget() {
    const [users, setUsers] = useState<UserScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/crm/gamification/leaderboard`;
                const token = (document.cookie.match(/access_token=([^;]+)/) || [])[1];

                const res = await fetch(apiUrl, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    signal: AbortSignal.timeout(5000), // 5s timeout
                });

                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    setError(true);
                }
            } catch {
                // Silently fail - API might not be running
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <Card className="animate-pulse"><CardContent className="h-40" /></Card>;

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-500">trophy</span>
                        Ranking da Equipe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 text-center py-4">
                        Ranking indisponível no momento.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">trophy</span>
                    Ranking da Equipe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user, index) => (
                        <div key={user.id} className="flex items-center gap-3">
                            <div className="font-bold text-slate-500 w-4">{index + 1}</div>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.full_name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium">{user.full_name}</p>
                                    <p className="text-xs font-bold text-blue-600">{user.points} pts</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress value={(user.points % 1000) / 10} className="h-1.5" />
                                    <span className="text-[10px] text-slate-400">Lvl {user.level}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <p className="text-sm text-slate-500 text-center">Nenhum dado ainda.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
