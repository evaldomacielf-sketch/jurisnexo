import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestCodeDto, RequestCodeSchema, ExchangeCodeDto, ExchangeCodeSchema } from './dto/auth.dto';
import { Response } from 'express';
// Pipe for Zod? Or manual validation. 
// Standard NestJS Zod Pipe is common. I'll do manual for simplicity or use ValidationPipe if setup.
// I'll stick to simple manual parse or validation pipe if I configured it (I used ValidationPipe in main.ts).
// But ValidationPipe uses class-validator. My DTOs are Zod. 
// I'll add a ZodPipe or just parse in controller.

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('request-code')
    @HttpCode(200)
    async requestCode(@Body() body: RequestCodeDto) {
        // Logic inside service handles validation if passed correctly, but better to parse here.
        const { email } = RequestCodeSchema.parse(body);
        return this.authService.requestCode(email);
    }

    @Post('exchange')
    @HttpCode(200)
    async exchange(@Body() body: ExchangeCodeDto, @Res({ passthrough: true }) res: Response) {
        const { email, code } = ExchangeCodeSchema.parse(body);
        return this.authService.exchangeCode(email, code, res);
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
        return { message: 'Logged out' };
    }
}
