import { IAIProvider, AIResponse } from './interface';

export class WorkersAIProvider implements IAIProvider {
    private ai: any;
    private modelName: string;
    public config?: import('./interface').AIConfig;

    constructor(ai: any, modelName: string = '@cf/meta/llama-3-8b-instruct') {
        this.ai = ai;
        this.modelName = modelName;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        if (!this.ai) {
            throw new Error('Cloudflare Workers AI binding is not configured');
        }

        const systemPrompt = this.config?.systemPrompt || 'You are a professional Bazi consultant. Return only valid JSON.';
        
        try {
            const response = await this.ai.run(this.modelName, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: this.config?.temperature ?? 0.6,
                max_tokens: 2500, // Ensure enough tokens for bilingual report
            });

            // Workers AI might return text or JSON depending on the model/output
            let content = '';
            if (typeof response === 'string') {
                content = response;
            } else if (response.response) {
                content = response.response;
            } else if (response.result) {
                content = response.result;
            } else {
                content = JSON.stringify(response);
            }

            if (!content) throw new Error('Workers AI failed to generate content');

            // Find the first '{' and last '}' to extract JSON
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) {
                throw new Error('Workers AI did not return a valid JSON object');
            }
            const jsonStr = content.substring(firstBrace, lastBrace + 1);
            try {
                const result = JSON.parse(jsonStr) as AIResponse;
                return result;
            } catch (parseError) {
                console.error('Workers AI JSON Parse Error. Raw content snippet:', content.substring(0, 200));
                throw new Error('Failed to parse AI response as JSON');
            }
        } catch (error: any) {
            throw new Error(`Workers AI error: ${error.message}`);
        }
    }
}
