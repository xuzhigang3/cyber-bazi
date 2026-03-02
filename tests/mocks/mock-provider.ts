import { IAIProvider, AIResponse } from '../app/api/generate/providers/interface';

export class MockAIProvider implements IAIProvider {
    async generateContent(prompt: string): Promise<AIResponse> {
        return {
            bazi: {
                year: '甲辰',
                month: '丙寅',
                day: '戊子',
                hour: '庚申',
            },
            summary: '这是一份模拟的八字分析摘要。',
            report: '这是详细的模拟报告内容。包含事业、财运、感情等维度的深度分析。'
        };
    }
}
