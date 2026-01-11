import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'jurisnexo-worker',
            version: '0.0.1',
            environment: process.env.NODE_ENV,
        };
    }
}
