import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: Request) => req?.cookies?.['access_token']
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });

        this.supabase = createClient(
            this.configService.get('SUPABASE_URL'),
            // Fallback to SERVICE_ROLE_KEY if SERVICE_KEY is missing (env.ts uses ROLE_KEY)
            this.configService.get('SUPABASE_SERVICE_KEY') || this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
        );
    }

    async validate(payload: any) {
        // Validar se usuário ainda existe e está ativo
        const { data: user, error } = await this.supabase
            .from('users')
            .select('id, email, name, role, tenant_id, status')
            .eq('id', payload.sub)
            .single();

        if (error || !user || user.status !== 'active') {
            throw new UnauthorizedException('Usuário inválido ou inativo');
        }

        // Retornar dados do usuário (será injetado em req.user)
        return {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenant_id,
        };
    }
}
