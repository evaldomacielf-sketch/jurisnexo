import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1a2130]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[#f6f6f8] dark:bg-[#101622] overflow-hidden">
                <Header />
                {children}
            </div>
        </div>
    );
}
