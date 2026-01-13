import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

// Jest Mocks for external libraries to avoid real connections
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn(),
        get: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        keys: jest.fn().mockResolvedValue([]),
        on: jest.fn(),
    }));
});

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }), // Default match nothing
    }),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(false), // Default fail comparison
}));

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(() => 'mock-token'),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: any = {
                                SUPABASE_URL: 'http://localhost:54321',
                                SUPABASE_SERVICE_KEY: 'mock-key',
                                SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
                                JWT_SECRET: 'test-secret',
                                JWT_REFRESH_SECRET: 'test-refresh-secret',
                                JWT_EXPIRATION: 900,
                                JWT_REFRESH_EXPIRATION: 604800,
                                REDIS_HOST: 'localhost',
                                REDIS_PORT: 6379,
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should throw UnauthorizedException for invalid credentials', async () => {
            // Mock bcrypt to return false (password mismatch) or supabase to return null
            // The default mock above returns data: null for supabase .single(), so user not found -> Unauthorized
            await expect(
                service.login({ email: 'invalid@test.com', password: 'wrong' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

});
