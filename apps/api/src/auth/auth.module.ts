import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ServicesModule } from '../services/services.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@jurisnexo/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        ServicesModule,
        PassportModule,
        JwtModule.register({
            secret: env.JWT_SECRET || 'fallback_secret',
            signOptions: { expiresIn: '15m' }, // Default
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule { }
