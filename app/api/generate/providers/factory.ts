import { IAIProvider } from './interface';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export function getProvider(): IAIProvider {
    const providerType = process.env.AI_PROVIDER || 'gemini';

    if (providerType === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

        return new OpenAIProvider(
            apiKey,
            process.env.OPENAI_BASE_URL,
            process.env.AI_MODEL || 'gpt-4o'
        );
    }

    // Default to Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    return new GeminiProvider(
        apiKey,
        process.env.AI_MODEL || 'gemini-2.0-flash'
    );
}
