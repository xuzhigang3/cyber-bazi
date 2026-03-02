import { IAIProvider } from './interface';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export async function getProvider(db?: any): Promise<IAIProvider> {
    let providerType = process.env.AI_PROVIDER || 'gemini';
    let aiModel = process.env.AI_MODEL || 'gemini-2.0-flash';
    let temperature = 0.7;
    let systemPrompt: string | undefined = undefined;

    // Try to get dynamic config from D1 if available
    if (db) {
        try {
            const dynamicProvider = (await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_PROVIDER').first()) as any;
            const dynamicModel = (await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_MODEL').first()) as any;
            const dynamicTemp = (await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_TEMPERATURE').first()) as any;
            const dynamicPrompt = (await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_SYSTEM_PROMPT').first()) as any;

            if (dynamicProvider) providerType = dynamicProvider.value;
            if (dynamicModel) aiModel = dynamicModel.value;
            if (dynamicTemp) temperature = parseFloat(dynamicTemp.value);
            if (dynamicPrompt) systemPrompt = dynamicPrompt.value;
        } catch (e) {
            console.warn('Failed to read dynamic config from D1, falling back to env:', e);
        }
    }

    let provider: IAIProvider;

    if (providerType === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

        provider = new OpenAIProvider(
            apiKey,
            process.env.OPENAI_BASE_URL,
            aiModel
        );
    } else {
        // Default to Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

        provider = new GeminiProvider(apiKey, aiModel);
    }

    provider.config = {
        temperature,
        systemPrompt
    };

    return provider;
}
