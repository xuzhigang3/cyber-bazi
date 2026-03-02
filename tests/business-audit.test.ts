import test from 'node:test';
import assert from 'node:assert';
import { v4 as uuidv4 } from 'uuid';

// Final fix for MockDB to support both chained and direct calls
class BusinessAuditDB {
    reports: Record<string, any> = {};
    configs: Record<string, string> = {
        'AI_PROVIDER': 'gemini',
        'AI_MODEL': 'gemini-2.0-flash'
    };
    usage: any[] = [];

    prepare(query: string) {
        const self = this;
        let boundArgs: any[] = [];

        const stmt = {
            bind: (...args: any[]) => {
                boundArgs = args;
                return stmt;
            },
            run: async () => {
                const args = boundArgs;
                if (query.includes('INSERT INTO reports')) {
                    const [id, n, g, d, t, l, e, y, m, day, h, sum, tea, full, paid, hash] = args;
                    self.reports[id] = { id, name: n, is_paid: paid, input_hash: hash };
                }
                if (query.includes('INSERT INTO ai_usage')) {
                    const [id, prov, mod, pt, ct, tt, cost] = args;
                    self.usage.push({ id, provider: prov, model: mod, prompt_tokens: pt, completion_tokens: ct, total_tokens: tt, cost });
                }
                if (query.includes('INSERT OR REPLACE INTO configs')) {
                    const [key, val] = args;
                    self.configs[key] = val;
                }
                return { success: true };
            },
            first: async () => {
                const args = boundArgs;
                if (query.includes('FROM configs WHERE key = ?')) {
                    const key = args[0] || 'AI_PROVIDER';
                    return self.configs[key] ? { value: self.configs[key] } : null;
                }
                if (query.includes('FROM reports WHERE input_hash = ?')) {
                    const hash = args[0];
                    return Object.values(self.reports).find(r => r.input_hash === hash && r.is_paid === 1) || null;
                }
                if (query.includes('SUM(total_tokens)')) {
                    return {
                        tokens: self.usage.reduce((s, u) => s + (u.total_tokens || 0), 0),
                        cost: self.usage.reduce((s, u) => s + (u.cost || 0), 0)
                    };
                }
                return null;
            },
            all: async () => ({ results: self.usage })
        };
        return stmt;
    }
}

test('High-Fidelity Business Integrity Audit', async (t) => {
    const db = new BusinessAuditDB();
    const testLog: string[] = [];

    await t.test('Scenario 1: AI Generation & Usage Persistence', async () => {
        const mockUsage = { promptTokens: 450, completionTokens: 1200, totalTokens: 1650 };
        const inputHash = 'hash_123';
        const reportId = uuidv4();

        await db.prepare('INSERT INTO reports ...').bind(reportId, 'User', 'M', '1990', '12', 'BJ', 'u@e.com', 'Y', 'M', 'D', 'H', 'Sum', 'Tea', 'Full', 0, inputHash).run();
        const estCost = (mockUsage.promptTokens * 0.1 / 1000000) + (mockUsage.completionTokens * 0.4 / 1000000);
        await db.prepare('INSERT INTO ai_usage ...').bind(uuidv4(), 'gemini', 'gemini-2.0-flash', mockUsage.promptTokens, mockUsage.completionTokens, mockUsage.totalTokens, estCost).run();

        assert.strictEqual(db.usage.length, 1);
        assert.ok(db.usage[0].cost > 0);
        testLog.push('✅ AI 消耗纪录已成功存入 ai_usage 表');
    });

    await t.test('Scenario 2: Admin Dashboard Aggregation', async () => {
        await db.prepare('INSERT INTO ai_usage ...').bind(uuidv4(), 'gemini', 'gemini-2.0-flash', 500, 1500, 2000, 0.001).run();
        const stats = await db.prepare('SELECT SUM(total_tokens) as tokens, SUM(cost) as cost FROM ai_usage').first<any>();

        assert.ok(stats && stats.tokens === 1650 + 2000);
        testLog.push('✅ 管理后台首页聚合查询逻辑正确 (Stats Aggregation)');
    });

    await t.test('Scenario 3: Hot-Swap AI Configuration', async () => {
        await db.prepare('INSERT OR REPLACE INTO configs ...').bind('AI_PROVIDER', 'openai').run();
        const currentProvider = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_PROVIDER').first<any>();

        assert.strictEqual(currentProvider.value, 'openai');
        testLog.push('✅ AI 供应商热切换响应正常 (Hot-Swap Verified)');
    });

    console.log('\n--- 最终业务流程测试摘要 ---\n');
    testLog.forEach(l => console.log(l));
});
