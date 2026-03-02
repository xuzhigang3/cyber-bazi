import { GoogleGenAI, Type } from '@google/genai';
import { IAIProvider, AIResponse } from './interface';

export class GeminiProvider implements IAIProvider {
    private ai: GoogleGenAI;
    private modelName: string;
    public config?: import('./interface').AIConfig;

    constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
        this.ai = new GoogleGenAI({ apiKey });
        this.modelName = modelName;
    }

    async generateContent(prompt: string): Promise<AIResponse> {
        const fullPrompt = this.config?.systemPrompt
            ? `${this.config.systemPrompt}\n\nUser Question: ${prompt}`
            : prompt;

        const response = await this.ai.models.generateContent({
            model: this.modelName,
            contents: fullPrompt,
            config: {
                temperature: this.config?.temperature ?? 0,
                topP: 0.1,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bazi: {
                            type: Type.OBJECT,
                            properties: {
                                year: { type: Type.STRING },
                                month: { type: Type.STRING },
                                day: { type: Type.STRING },
                                hour: { type: Type.STRING },
                            },
                            required: ['year', 'month', 'day', 'hour'],
                        },
                        summary: { type: Type.STRING },
                        report: { type: Type.STRING },
                    },
                    required: ['bazi', 'summary', 'report'],
                },
            },
        });

        const usage = response.usageMetadata;
        const text = response.text;

        if (!text) throw new Error('Gemini failed to generate content');

        let jsonStr = text.trim();
        // Clean up potential markdown formatting if not handled by responseMimeType
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

        const result = JSON.parse(jsonStr.trim()) as AIResponse;

        if (usage) {
            result.usage = {
                promptTokens: usage.promptTokenCount,
                completionTokens: usage.candidatesTokenCount,
                totalTokens: usage.totalTokenCount
            };
        }

        return result;
    }
}
