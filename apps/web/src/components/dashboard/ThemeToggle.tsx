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
    return <div className="w-[120px] p-2"></div>;
  }

  const isActive = (t: string) => theme === t;

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#dbdfe6] bg-gray-100 p-1 dark:border-[#2d3748] dark:bg-gray-800">
      <button
        onClick={() => {
          console.log('Switching to light');
          setTheme('light');
        }}
        className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
          isActive('light')
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-[#616f89] hover:text-gray-900'
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
        className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
          isActive('dark')
            ? 'bg-white text-blue-600 shadow-sm dark:bg-[#1a2130] dark:text-blue-400'
            : 'text-[#616f89] hover:text-gray-300'
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
        className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
          isActive('system')
            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
            : 'text-[#616f89]'
        }`}
        title="Sistema"
      >
        <span className="material-symbols-outlined text-lg">desktop_windows</span>
      </button>
    </div>
  );
}
