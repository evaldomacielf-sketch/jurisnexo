"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("./../src/app.module");
describe('AuthModule (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    const testEmail = `e2e_test_${Date.now()}@example.com`;
    it('/auth/request-code (POST)', async () => {
        // We expect 200 and "Code sent"
        // Mocking SendGrid/Redis would be ideal, but for e2e we rely on real (if avail) or mock
        // if using real Redis (docker), this passes.
        // SendGrid key might be missing in CI, prompting console warning but success flow.
        return (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/request-code')
            .send({ email: testEmail })
            .expect(200)
            .expect((res) => {
            expect(res.body.message).toBe('Code sent');
        });
    });
    // Note: Testing /auth/exchange requires knowing the code. 
    // In real E2E we'd need to peek into Redis or mock the RedisService.
    // For this exercise, I'm providing the test skeleton.
});
//# sourceMappingURL=auth.e2e-spec.js.map