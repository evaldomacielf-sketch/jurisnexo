import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';

import { validateEnv, apiEnvSchema } from '@jurisnexo/config';

async function bootstrap() {
    // Validate Env first
    console.log('🔍 Checking Env Variables...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Unset');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Unset');
    validateEnv(apiEnvSchema, 'API');

    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('JurisNexo API')
        .setDescription('API para o CRM Jurídico JurisNexo')
        .setVersion('0.0.1')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.API_PORT || 4000;
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}`);
    console.log(`📚 Docs available at http://localhost:${port}/docs`);
}

bootstrap();
