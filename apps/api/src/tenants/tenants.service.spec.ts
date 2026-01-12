import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';

// Mock DB client
const mockDb = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
};

// Mock Auth
const mockAuth = {};

jest.mock('@jurisnexo/db', () => ({
    createAdminClient: () => mockDb,
}));

describe('TenantsService', () => {
    let service: TenantsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TenantsService,
                { provide: AuthService, useValue: mockAuth },
            ],
        }).compile();

        service = module.get<TenantsService>(TenantsService);
        jest.clearAllMocks();
    });

    it('should generate unique slugs', async () => {
        // Mock DB for Slug Check
        // Case 1: Simple
        mockDb.select.mockResolvedValueOnce({ count: 0 }); // First check: simple-name -> unique
        let slug = await service['generateUniqueSlug']('Simple Name');
        expect(slug).toBe('simple-name');

        // Case 2: Collision
        // "collision" exists
        mockDb.select
            .mockResolvedValueOnce({ count: 1 }) // collision
            .mockResolvedValueOnce({ count: 1 }) // collision-2
            .mockResolvedValueOnce({ count: 0 }); // collision-3

        slug = await service['generateUniqueSlug']('collision');
        expect(slug).toBe('collision-3');
    });

    it('should block reserved slugs', async () => {
        mockDb.select.mockResolvedValue({ count: 0 });

        // "admin" -> reserved -> "admin-app"
        let slug = await service['generateUniqueSlug']('admin');
        expect(slug).toBe('admin-app');
    });
});
