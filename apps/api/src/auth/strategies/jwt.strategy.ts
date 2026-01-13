import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from '@jurisnexo/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    // Extract from cookie or header
                    if (req && req.cookies && req.cookies['access_token']) {
                        return req.cookies['access_token'];
                    }
                    // Fallback to Bearer token
                    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: env.JWT_SECRET || 'fallback_secret', // Should validate config properly
        });
    }

    async validate(payload: any) {
        if (!payload.sub) throw new UnauthorizedException();
        // Use admin client to verify if user still exists? Or just trust token?
        // For performance, trust token.
        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.app_metadata?.tenant_id || payload.tenant_id // normalize
        };
    }
}
