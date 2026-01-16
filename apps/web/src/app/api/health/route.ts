import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'jurisnexo-next',
        version: '0.0.1',
        environment: process.env.NODE_ENV,
    });
}
