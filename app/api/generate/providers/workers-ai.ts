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

        const systemPrompt = this.config?.systemPrompt || 
            'You are an expert Bazi master. You MUST return ONLY a valid JSON object. Do not include any introductory or concluding text. Do not use code blocks. Start your response with "{" and end with "}".';
        
        try {
            const response = await this.ai.run(this.modelName, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1, // Lower temperature for more consistent JSON structure
                max_tokens: 3500, // Increased to avoid truncation
            });

            // Workers AI might return text or JSON depending on the model/output
            let content = '';
            if (typeof response === 'string') {
                content = response;
            } else if (response.response) {
                content = response.response;
            } else if (response.result) {
                content = response.result;
            } else if (typeof response === 'object' && response !== null) {
                // Some models return objects directly
                content = JSON.stringify(response);
            }

            if (!content) throw new Error('Workers AI failed to generate content');

            // Find the first '{' and last '}' to extract JSON
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            
            if (firstBrace === -1 || lastBrace === -1) {
                console.error('Workers AI non-JSON content:', content.substring(0, 500));
                throw new Error('Workers AI did not return a valid JSON object');
            }

            const jsonStr = content.substring(firstBrace, lastBrace + 1);
            try {
                const result = JSON.parse(jsonStr) as AIResponse;
                return result;
            } catch (parseError) {
                console.error('Workers AI JSON Parse Error. Length:', content.length, 'Snippet:', content.substring(0, 1000));
                throw new Error('Failed to parse AI response as JSON. The output might be truncated.');
            }
        } catch (error: any) {
            throw new Error(`Workers AI error: ${error.message}`);
        }
    }
}
