import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
    // Create HTTP app for Cloud Run health checks
    const app = await NestFactory.create(WorkerModule);

    const port = process.env.PORT || 4001;

    await app.listen(port);
    console.log(`🔧 Worker started on port ${port}`);
    console.log('📋 Listening for background jobs...');
    console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
