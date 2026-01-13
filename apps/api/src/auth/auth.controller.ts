import { Controller, Post, Body, Res, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';
import { LoginSchema, LoginDto } from './dto/login.dto';
import { ForgotPasswordSchema } from './dto/forgot-password.dto';
import { ResetPasswordSchema } from './dto/reset-password.dto';
import { Response } from 'express';
// Note: RequestCode and ExchangeCode schemas are legacy/OTP.
// I should move them too or keep using auth.dto.ts temporary if they are not in the new plan?
// Plan mentions "RequestCodeDto... legacy/OTP".
// I'll keep auth.dto.ts for now for backward compat OR move strict ones.
// I'll assume users wants FULL refactor so I should move them or import from auth.dto if still there.
// For this step I will mix imports or ideally created all DTOs.
// I missed RequestCode/ExchangeCode in previous step. I'll recreate auth.dto.ts content in new files or keep auth.dto.ts as "legacy.dto.ts".
// For now, I'll import legacy from `./dto/auth.dto` if it exists, or create them.
import { RequestCodeDto, RequestCodeSchema, ExchangeCodeDto, ExchangeCodeSchema } from './dto/auth.dto';
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
        const { email } = RequestCodeSchema.parse(body);
        return this.authService.requestCode(email);
    }

    @Post('exchange')
    @HttpCode(200)
    async exchange(@Body() body: ExchangeCodeDto, @Res({ passthrough: true }) res: Response) {
        const { email, code } = ExchangeCodeSchema.parse(body);
        return this.authService.exchangeCode(email, code, res);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { email, password } = LoginSchema.parse(body);
        return this.authService.loginWithPassword(email, password, res);
    }

    @Post('register-invite')
    @HttpCode(200)
    async registerInvite(@Body() body: { token: string; fullName: string; password: string }, @Res({ passthrough: true }) res: Response) {
        if (!body.token || !body.fullName || !body.password) throw new Error('Missing fields');
        return this.authService.registerWithInvite(body.token, body.fullName, body.password, res);
    }

    @Post('register')
    @HttpCode(200)
    async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const dto = RegisterSchema.parse(body);
        return this.authService.register(dto, res);
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() body: any, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.refresh_token || body.refreshToken;
        if (!token) throw new Error('Refresh Token missing');
        return this.authService.refreshSession(token, res);
    }

    @Post('forgot-password')
    @HttpCode(200)
    async forgotPassword(@Body() body: any) {
        const { email } = ForgotPasswordSchema.parse(body);
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(200)
    async resetPassword(@Body() body: any) {
        const dto = ResetPasswordSchema.parse(body);
        return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
        return { message: 'Logged out' };
    }
}
