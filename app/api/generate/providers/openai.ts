import { IAIProvider, AIResponse } from './interface';

export class OpenAIProvider implements IAIProvider {
    private apiKey: string;
    private baseUrl: string;
    private modelName: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', modelName: string = 'gpt-4o') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.modelName = modelName;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0,
                seed: 42,
                response_format: { type: 'json_object' }
            }),
        });

        if (!res.ok) {
            const error = await res.json() as any;
            throw new Error(`OpenAI API error: ${error?.error?.message || res.statusText}`);
        }

        const data = await res.json() as any;
        const content = data.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI failed to generate content');

        return JSON.parse(content) as AIResponse;
    }
}
