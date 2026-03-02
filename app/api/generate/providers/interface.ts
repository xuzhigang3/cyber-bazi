export interface AIResponse {
    bazi: {
        year: string;
        month: string;
        day: string;
        hour: string;
    };
    summary: string;
    report: string;
}

export interface IAIProvider {
    generateContent(prompt: string): Promise<AIResponse>;
}
