import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Validation global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Global Prefix
    app.setGlobalPrefix('api');

    // CORS
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3000'
        ],
        credentials: true,
    });

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('JurisNexo API')
        .setDescription('API do sistema JurisNexo')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    const port = process.env.API_PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 API running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
