export interface AIUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface AIResponse {
    bazi: {
        year: string;
        month: string;
        day: string;
        hour: string;
    };
    summary: string;
    report: string;
    usage?: AIUsage;
}

export interface AIConfig {
    temperature?: number;
    systemPrompt?: string;
}

export interface IAIProvider {
    config?: AIConfig;
    generateContent(prompt: string): Promise<AIResponse>;
}
