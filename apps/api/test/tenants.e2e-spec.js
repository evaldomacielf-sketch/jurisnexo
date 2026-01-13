"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
// We need a helper to get valid tokens. 
// Since E2E on pure endpoints is hard without real email flow, we will mock AuthGuard or login first.
// But mocking AuthGuard defeats the purpose of testing security.
// We can use a test util endpoint to mint a token if env is test?
// Or we can just use the functionality we have.
// We need to request code, then verify code to get cookies.
// Then use cookies to create tenant.
describe('Tenants (e2e)', () => {
    let app;
    // let authCookies: string[];
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        // 1. Setup User & Session
        // Cheat: directly create user and sign token using AuthService if possible?
        // Or go through public API
        // Let's rely on manual token minting for test via a temporary hack or just mocking the AuthService token generation?
        // Actually, integration testing with Supabase is heavy.
        // Assuming we have a valid token (can implement a test-only endpoint/service later).
        // For now, I'll rely on a placeholder test or try to run the full flow.
    });
    afterAll(async () => {
        await app.close();
    });
    it('should be defined', () => {
        expect(app).toBeDefined();
    });
    // it('should create a tenant', async () => {});
    // it('should block reserved slug', ...);
    // it('should increment slug', ...);
});
//# sourceMappingURL=tenants.e2e-spec.js.map