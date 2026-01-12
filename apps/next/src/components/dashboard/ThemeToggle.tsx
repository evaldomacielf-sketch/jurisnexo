'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-[120px]"></div>;
    }

    const isActive = (t: string) => theme === t;

    return (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-[#dbdfe6] dark:border-[#2d3748]">
            <button
                onClick={() => {
                    console.log('Switching to light');
                    setTheme('light');
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${isActive('light') ? 'bg-white text-blue-600 shadow-sm' : 'text-[#616f89] hover:text-gray-900'
                    }`}
                title="Versão Branca"
            >
                <span className="material-symbols-outlined text-lg">light_mode</span>
            </button>
            <button
                onClick={() => {
                    console.log('Switching to dark');
                    setTheme('dark');
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${isActive('dark') ? 'bg-white dark:bg-[#1a2130] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[#616f89] hover:text-gray-300'
                    }`}
                title="Tela Escura"
            >
                <span className="material-symbols-outlined text-lg">dark_mode</span>
            </button>
            <button
                onClick={() => {
                    console.log('Switching to system');
                    setTheme('system');
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${isActive('system') ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[#616f89]'
                    }`}
                title="Sistema"
            >
                <span className="material-symbols-outlined text-lg">desktop_windows</span>
            </button>
        </div>
    );
}
