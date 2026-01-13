"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tenants_service_1 = require("./tenants.service");
const auth_service_1 = require("../auth/auth.service");
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
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tenants_service_1.TenantsService,
                { provide: auth_service_1.AuthService, useValue: mockAuth },
            ],
        }).compile();
        service = module.get(tenants_service_1.TenantsService);
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
//# sourceMappingURL=tenants.service.spec.js.map