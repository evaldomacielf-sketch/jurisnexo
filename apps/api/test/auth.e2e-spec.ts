import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthModule (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
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

        return request(app.getHttpServer())
            .post('/auth/request-code')
            .send({ email: testEmail })
            .expect(200)
            .expect((res: any) => {
                expect(res.body.message).toBe('Code sent');
            });
    });

    // Note: Testing /auth/exchange requires knowing the code. 
    // In real E2E we'd need to peek into Redis or mock the RedisService.
    // For this exercise, I'm providing the test skeleton.
});
