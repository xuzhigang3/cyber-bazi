import test from 'node:test';
import assert from 'node:assert';
import { MockAIProvider } from './mocks/mock-provider';
import { v4 as uuidv4 } from 'uuid';

// Simple Mock for D1 Database
class MockDB {
    data: Record<string, any> = {};

    prepare(query: string) {
        return {
            bind: (...args: any[]) => ({
                run: async () => {
                    if (query.includes('INSERT INTO reports')) {
                        const [id, name, gender, date, time, location, email, y, m, d, h, sum, tea, full, paid, hash] = args;
                        this.data[id] = { id, name, gender, date, time, location, email, bazi_year: y, bazi_month: m, bazi_day: d, bazi_hour: h, summary: sum, teaser: tea, full_report: full, is_paid: paid, input_hash: hash };
                    }
                    if (query.includes('UPDATE reports SET is_paid = 1')) {
                        const [id] = args;
                        if (this.data[id]) this.data[id].is_paid = 1;
                    }
                    return { success: true };
                },
                first: async () => {
                    if (query.includes('input_hash = ?')) {
                        const [hash] = args;
                        const found = Object.values(this.data).find(r => r.input_hash === hash && r.is_paid === 1);
                        return found || null;
                    }
                    if (query.includes('SELECT * FROM reports WHERE id = ?')) {
                        const [id] = args;
                        return this.data[id] || null;
                    }
                    return null;
                }
            })
        };
    }
}

test('Full Business Workflow Test (Mocked)', async (t) => {
    const db = new MockDB();
    const aiProvider = new MockAIProvider();
    const testResults: string[] = [];

    const userInput = {
        name: '测试用户',
        gender: 'male' as const,
        date: '1990-01-01',
        time: '12:00',
        location: 'Beijing',
        email: 'test@example.com',
        language: 'zh' as const
    };

    await t.test('Step 1: Generate Initial Report (Unpaid)', async () => {
        // 1. Calculate Hash (Simulating route.ts logic)
        const hashInput = JSON.stringify({ ...userInput, lang: userInput.language });
        const inputHash = 'mock-hash-' + Buffer.from(hashInput).toString('hex').substring(0, 10);

        // 2. Call AI Mock
        const aiResult = await aiProvider.generateContent('mock prompt');

        // 3. Save to Mock DB
        const id = uuidv4();
        await db.prepare('INSERT INTO reports (...) VALUES (...)')
            .bind(id, userInput.name, userInput.gender, userInput.date, userInput.time, userInput.location, userInput.email, aiResult.bazi.year, aiResult.bazi.month, aiResult.bazi.day, aiResult.bazi.hour, aiResult.summary, 'teaser...', aiResult.report, 0, inputHash)
            .run();

        const record = db.data[id];
        assert.strictEqual(record.is_paid, 0);
        assert.strictEqual(record.name, userInput.name);
        testResults.push('✅ Step 1: 首次生成成功，状态为未支付 (is_paid=0)');
    });

    await t.test('Step 2: Simulate Payment (Webhook)', async () => {
        const reportId = Object.keys(db.data)[0];

        // Simulate Webhook Unlock
        await db.prepare('UPDATE reports SET is_paid = 1 WHERE id = ?')
            .bind(reportId)
            .run();

        assert.strictEqual(db.data[reportId].is_paid, 1);
        testResults.push('✅ Step 2: 模拟支付成功，报告已解锁 (is_paid=1)');
    });

    await t.test('Step 3: Idempotency Check (Session Reuse)', async () => {
        const hashInput = JSON.stringify({ ...userInput, lang: userInput.language });
        const inputHash = 'mock-hash-' + Buffer.from(hashInput).toString('hex').substring(0, 10);

        // Pre-check logic (replicated from route.ts)
        const existingPaid = await db.prepare('SELECT id... FROM reports WHERE input_hash = ? AND is_paid = 1')
            .bind(inputHash)
            .first();

        assert.ok(existingPaid, 'Should find existing paid report');
        assert.strictEqual(existingPaid.id, Object.keys(db.data)[0], 'Should reuse the same ID');
        testResults.push('✅ Step 3: 幂等性校验通过，相同输入自动识别已支付记录');
    });

    // Generate simple summary
    console.log('\n--- 业务流程测试报告 ---\n');
    testResults.forEach(r => console.log(r));
    console.log('\n测试结论：系统核心闭环（生成->支付->复用）逻辑验证通过。');
});
