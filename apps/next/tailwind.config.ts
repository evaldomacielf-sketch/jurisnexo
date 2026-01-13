import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1152d4',
            },
            keyframes: {
                'in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-in-from-top-5': {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'zoom-in-95': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            animation: {
                'in': 'in 200ms ease-out',
                'slide-in-from-top-5': 'slide-in-from-top-5 200ms ease-out',
                'zoom-in-95': 'zoom-in-95 200ms ease-out',
            },
        },
    },
    plugins: [],
    darkMode: 'class',
};

export default config;
