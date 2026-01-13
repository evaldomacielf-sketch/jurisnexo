import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import {
    RegisterDto,
    LoginDto,
    RefreshTokenDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyEmailDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Ensure we can use it if needed, though user code omitted usage.

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Registrar novo usuário e tenant' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Email ou slug já existe' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login com email e senha' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renovar access token' })
    @ApiResponse({ status: 200, description: 'Token renovado' })
    @ApiResponse({ status: 401, description: 'Refresh token inválido' })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout (invalidar refresh token)' })
    @ApiResponse({ status: 200, description: 'Logout realizado' })
    async logout(@Body() dto: RefreshTokenDto) {
        return this.authService.logout(dto.refreshToken);
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Solicitar reset de senha' })
    @ApiResponse({ status: 200, description: 'Email enviado (se existir)' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Redefinir senha com token' })
    @ApiResponse({ status: 200, description: 'Senha redefinida' })
    @ApiResponse({ status: 400, description: 'Token inválido' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verificar email com token' })
    @ApiResponse({ status: 200, description: 'Email verificado' })
    @ApiResponse({ status: 400, description: 'Token inválido' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto.token);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obter dados do usuário logado' })
    @ApiResponse({ status: 200, description: 'Dados do usuário' })
    async getMe(@CurrentUser() user: any) {
        return { user };
    }
}
