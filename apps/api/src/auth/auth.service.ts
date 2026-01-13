import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
    Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';
import { RegisterDto, LoginDto, ResetPasswordDto, ForgotPasswordDto } from './dto';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;
    private redis: Redis;
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        // Inicializar Supabase
        this.supabase = createClient(
            this.configService.get('SUPABASE_URL'),
            // Patch: Using SUPABASE_SERVICE_ROLE_KEY to match global env config
            this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get('SUPABASE_SERVICE_KEY'),
        );

        // Inicializar Redis
        const redisUrl = this.configService.get('REDIS_URL');
        if (redisUrl) {
            this.redis = new Redis(redisUrl, { lazyConnect: true });
        } else {
            this.redis = new Redis({
                host: this.configService.get('REDIS_HOST'),
                port: this.configService.get('REDIS_PORT'),
                lazyConnect: true,
            });
        }

        this.redis.connect().catch((err) => {
            this.logger.error('Redis connection error:', err);
        });
    }

    /**
     * Registrar novo usuário (cria tenant + user)
     */
    async register(dto: RegisterDto) {
        // 1. Verificar se tenant slug já existe
        const { data: existingTenant } = await this.supabase
            .from('tenants')
            .select('id')
            .eq('slug', dto.tenantSlug)
            .single();

        if (existingTenant) {
            throw new ConflictException('Slug do escritório já está em uso');
        }

        // 2. Verificar se email já existe
        const { data: existingUser } = await this.supabase
            .from('users')
            .select('id')
            .eq('email', dto.email)
            .single();

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        // 3. Hash da senha
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // 4. Criar tenant (transação manual via RPC)
        const { data: tenant, error: tenantError } = await this.supabase
            .from('tenants')
            .insert({
                slug: dto.tenantSlug,
                name: dto.name,
                plan: 'trial',
                status: 'active',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
            })
            .select()
            .single();

        if (tenantError) {
            throw new BadRequestException('Erro ao criar tenant: ' + tenantError.message);
        }

        // 5. Criar usuário (owner)
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .insert({
                tenant_id: tenant.id,
                email: dto.email,
                password_hash: passwordHash,
                name: dto.name,
                role: 'owner',
                status: 'active',
            })
            .select('id, email, name, role, tenant_id')
            .single();

        if (userError) {
            // Rollback: deletar tenant
            await this.supabase.from('tenants').delete().eq('id', tenant.id);
            throw new BadRequestException('Erro ao criar usuário: ' + userError.message);
        }

        // 6. Gerar token de verificação de email
        const verificationToken = randomBytes(32).toString('hex');
        await this.redis.setex(
            `email-verification:${verificationToken}`,
            3600, // 1 hora
            user.id,
        );

        // 7. Enviar email de verificação (TODO: implementar SendGrid)
        // await this.sendVerificationEmail(user.email, verificationToken);
        this.logger.log(`[Verification] Token for ${user.email}: ${verificationToken}`);

        // 8. Gerar tokens JWT
        const tokens = await this.generateTokens(user);

        return {
            message: 'Cadastro realizado com sucesso! Verifique seu email.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenant_id,
            },
            ...tokens,
        };
    }

    /**
     * Login com email e senha
     */
    async login(dto: LoginDto) {
        // 1. Rate limiting (evitar brute force)
        const attempts = await this.redis.incr(`login-attempts:${dto.email}`);
        if (attempts === 1) {
            await this.redis.expire(`login-attempts:${dto.email}`, 900); // 15 min
        }
        if (attempts > 5) {
            throw new UnauthorizedException(
                'Muitas tentativas de login. Tente novamente em 15 minutos.',
            );
        }

        // 2. Buscar usuário por email
        const { data: user, error } = await this.supabase
            .from('users')
            .select('id, email, password_hash, name, role, tenant_id, status')
            .eq('email', dto.email)
            .single();

        if (error || !user) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // 3. Verificar status do usuário
        if (user.status !== 'active') {
            throw new UnauthorizedException('Usuário inativo ou bloqueado');
        }

        // 4. Validar senha
        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // 5. Reset rate limiting (login bem-sucedido)
        await this.redis.del(`login-attempts:${dto.email}`);

        // 6. Atualizar last_login_at
        await this.supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        // 7. Gerar tokens JWT
        const tokens = await this.generateTokens(user);

        return {
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenant_id,
            },
            ...tokens,
        };
    }

    /**
     * Refresh token (renovar access token)
     */
    async refreshToken(refreshToken: string) {
        try {
            // 1. Verificar se refresh token está no Redis
            const userId = await this.redis.get(`refresh-token:${refreshToken}`);
            if (!userId) {
                throw new UnauthorizedException('Refresh token inválido ou expirado');
            }

            // 2. Verificar JWT refresh token
            // Note: If JWT_REFRESH_SECRET checks fail, it throws.
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            // 3. Buscar usuário atualizado
            const { data: user, error } = await this.supabase
                .from('users')
                .select('id, email, name, role, tenant_id, status')
                .eq('id', payload.sub)
                .single();

            if (error || !user || user.status !== 'active') {
                throw new UnauthorizedException('Usuário inválido');
            }

            // 4. Gerar novos tokens
            const tokens = await this.generateTokens(user);

            // 5. Remover refresh token antigo
            await this.redis.del(`refresh-token:${refreshToken}`);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido');
        }
    }

    /**
     * Logout (invalidar refresh token)
     */
    async logout(refreshToken: string) {
        if (refreshToken) {
            await this.redis.del(`refresh-token:${refreshToken}`);
        }
        return { message: 'Logout realizado com sucesso' };
    }

    /**
     * Forgot password (enviar email com token de reset)
     */
    async forgotPassword(email: string) {
        // 1. Buscar usuário
        const { data: user } = await this.supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .single();

        // Não revelar se email existe (segurança)
        if (!user) {
            return {
                message: 'Se o email existir, você receberá instruções de recuperação.',
            };
        }

        // 2. Gerar token de reset
        const resetToken = randomBytes(32).toString('hex');
        await this.redis.setex(
            `password-reset:${resetToken}`,
            3600, // 1 hora
            user.id,
        );

        // 3. Enviar email (TODO: implementar SendGrid)
        const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        // await this.sendPasswordResetEmail(user.email, resetLink);

        this.logger.log(`[DEV] Password reset link: ${resetLink}`);

        return {
            message: 'Se o email existir, você receberá instruções de recuperação.',
        };
    }

    /**
     * Reset password (com token)
     */
    async resetPassword(dto: ResetPasswordDto) {
        // 1. Verificar token no Redis
        const userId = await this.redis.get(`password-reset:${dto.token}`);
        if (!userId) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        // 2. Hash da nova senha
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);

        // 3. Atualizar senha no banco
        const { error } = await this.supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', userId);

        if (error) {
            throw new BadRequestException('Erro ao atualizar senha');
        }

        // 4. Remover token (uso único)
        await this.redis.del(`password-reset:${dto.token}`);

        // 5. Invalidar todos os refresh tokens do usuário
        const keys = await this.redis.keys(`refresh-token:*`);
        for (const key of keys) {
            const storedUserId = await this.redis.get(key);
            if (storedUserId === userId) {
                await this.redis.del(key);
            }
        }

        return { message: 'Senha redefinida com sucesso' };
    }

    /**
     * Verificar email (com token)
     */
    async verifyEmail(token: string) {
        // 1. Verificar token no Redis
        const userId = await this.redis.get(`email-verification:${token}`);
        if (!userId) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        // 2. Atualizar email_verified_at
        const { error } = await this.supabase
            .from('users')
            .update({ email_verified_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            throw new BadRequestException('Erro ao verificar email');
        }

        // 3. Remover token
        await this.redis.del(`email-verification:${token}`);

        return { message: 'Email verificado com sucesso!' };
    }

    /**
     * Gerar access token + refresh token
     */
    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
        };

        // Access token (curta duração)
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: `${this.configService.get('JWT_EXPIRATION')}s`,
        });

        // Refresh token (longa duração)
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION')}s`,
        });

        // Armazenar refresh token no Redis
        await this.redis.setex(
            `refresh-token:${refreshToken}`,
            this.configService.get('JWT_REFRESH_EXPIRATION'),
            user.id,
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get('JWT_EXPIRATION'),
        };
    }
}
