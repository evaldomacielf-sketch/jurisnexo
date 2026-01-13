import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';

export class EnvironmentVariables {
    @IsString()
    @IsString()
    DATABASE_URL!: string;

    @IsString()
    @IsString()
    JWT_SECRET!: string;

    @IsString()
    @IsString()
    JWT_REFRESH_SECRET!: string;

    @IsNumber()
    JWT_EXPIRATION: number = 900; // 15 minutos

    @IsNumber()
    JWT_REFRESH_EXPIRATION: number = 604800; // 7 dias

    @IsString()
    @IsString()
    REDIS_HOST!: string;

    @IsNumber()
    REDIS_PORT: number = 6379;

    @IsString()
    @IsString()
    SENDGRID_API_KEY!: string;

    @IsString()
    @IsString()
    SENDGRID_FROM_EMAIL!: string;

    @IsString()
    FRONTEND_URL: string = 'https://app.jurisnexo.com';
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
