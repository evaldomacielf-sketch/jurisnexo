import type { NextConfig } from 'next';
import { appConfig } from '@jurisnexo/config';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,

    // Standalone output for Docker
    output: 'standalone',

    // ✅ Configurar imagens
    images: {
        domains: ['localhost'],
    },

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

    // ✅ CRÍTICO: Configurar redirects para evitar loops
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
            },
        ];
    },

    // Headers for security & Cache
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    // Content Security Policy (Basic) + Localhost support
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.jurisnexo.com https://*.googleapis.com wss://*.jurisnexo.com http://localhost:4000;",
                    },
                ],
            },
            // ✅ Configurar headers para cache no dashboard
            {
                source: '/dashboard/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
