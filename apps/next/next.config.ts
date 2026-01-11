import type { NextConfig } from 'next';
import { appConfig } from '@jurisnexo/config';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,

    // Standalone output for Docker
    output: 'standalone',

    // Multi-host configuration
    async rewrites() {
        return {
            beforeFiles: [
                // Site routes (landing page)
                {
                    source: '/:path*',
                    has: [{ type: 'host', value: appConfig.hosts.site }],
                    destination: '/site/:path*',
                },
                // Auth routes
                {
                    source: '/:path*',
                    has: [{ type: 'host', value: appConfig.hosts.auth }],
                    destination: '/auth/:path*',
                },
                // App routes (default)
                {
                    source: '/:path*',
                    has: [{ type: 'host', value: appConfig.hosts.app }],
                    destination: '/app/:path*',
                },
            ],
            afterFiles: [],
            fallback: [],
        };
    },

    // Redirect root to appropriate location based on host
    async redirects() {
        return [];
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
        ];
    },
};

export default nextConfig;
