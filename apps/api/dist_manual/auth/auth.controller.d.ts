import { AuthService } from './auth.service';
import { RequestCodeDto, ExchangeCodeDto } from './dto/auth.dto';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    requestCode(body: RequestCodeDto): Promise<{
        message: string;
    }>;
    exchange(body: ExchangeCodeDto, res: Response): Promise<{
        user: {
            id: string;
            email: string | undefined;
        };
        message: string;
    }>;
    registerInvite(body: {
        token: string;
        fullName: string;
        password: string;
    }, res: Response): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map