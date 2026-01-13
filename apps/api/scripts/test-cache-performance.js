"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_service_1 = require("../src/services/redis.service");
const perf_hooks_1 = require("perf_hooks");
// Polyfill env if needed or rely on dotenv flow if project has it
// import * as dotenv from 'dotenv';
// dotenv.config();
async function loadTest() {
    const redisService = new redis_service_1.RedisService();
    // Initialize connection
    console.log('Initializing Redis Service...');
    await redisService.onModuleInit();
    // Basic check
    const pong = await redisService.ping();
    console.log(`Redis Ping: ${pong ? 'OK' : 'FAIL'}`);
    if (!pong) {
        console.error('Could not connect to Redis. Aborting test.');
        process.exit(1);
    }
    const iterations = 1000;
    const dataSize = 1000; // 1KB
    console.log(`\n🚀 Starting cache load test (${iterations} iterations)...\n`);
    // Test 1: Write performance
    const writeStart = perf_hooks_1.performance.now();
    for (let i = 0; i < iterations; i++) {
        await redisService.set(`load-test:${i}`, { data: 'x'.repeat(dataSize), index: i }, 60 // ttl
        );
    }
    const writeEnd = perf_hooks_1.performance.now();
    const writeTime = writeEnd - writeStart;
    console.log(`✅ WRITE: ${iterations} operations in ${writeTime.toFixed(2)}ms`);
    console.log(`   Average: ${(writeTime / iterations).toFixed(2)}ms per operation`);
    console.log(`   Throughput: ${(iterations / (writeTime / 1000)).toFixed(0)} ops/sec\n`);
    // Test 2: Read performance (cache hit)
    const readStart = perf_hooks_1.performance.now();
    for (let i = 0; i < iterations; i++) {
        await redisService.getOrSet(`load-test:${i}`, async () => ({ data: 'fallback' }), 60);
    }
    const readEnd = perf_hooks_1.performance.now();
    const readTime = readEnd - readStart;
    console.log(`✅ READ (cache hit): ${iterations} operations in ${readTime.toFixed(2)}ms`);
    console.log(`   Average: ${(readTime / iterations).toFixed(2)}ms per operation`);
    console.log(`   Throughput: ${(iterations / (readTime / 1000)).toFixed(0)} ops/sec\n`);
    // Cleanup
    console.log('Cleaning up...');
    await redisService.delPattern('load-test:*');
    await redisService.onModuleDestroy();
    console.log('✨ Load test completed\n');
}
loadTest().catch(console.error);
//# sourceMappingURL=test-cache-performance.js.map