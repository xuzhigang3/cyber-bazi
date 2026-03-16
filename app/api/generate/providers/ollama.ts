import { IAIProvider, AIResponse } from './interface';

export class OllamaProvider implements IAIProvider {
    private baseUrl: string;
    private modelName: string;

    public config?: import('./interface').AIConfig;

    constructor(baseUrl: string = 'http://localhost:11434', modelName: string = 'llama3') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.modelName = modelName;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const systemPrompt = this.config?.systemPrompt || 'You are a professional Bazi (Four Pillars of Destiny) consultant. Return only valid JSON.';
        
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: this.config?.temperature ?? 0.7,
                },
                format: 'json'
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Ollama API error (${res.status}): ${errorText || res.statusText}`);
        }

        const data = await res.json() as any;
        const content = data.message?.content;

        if (!content) throw new Error('Ollama failed to generate content');

        const result = JSON.parse(content) as AIResponse;

        // Ollama usually returns token counts in response
        if (data.prompt_eval_count || data.eval_count) {
            result.usage = {
                promptTokens: data.prompt_eval_count || 0,
                completionTokens: data.eval_count || 0,
                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
            };
        }

        return result;
    }
}
