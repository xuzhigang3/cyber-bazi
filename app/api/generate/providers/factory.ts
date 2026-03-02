import { IAIProvider } from './interface';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export async function getProvider(db?: any): Promise<IAIProvider> {
    let providerType = process.env.AI_PROVIDER || 'gemini';
    let aiModel = process.env.AI_MODEL || 'gemini-2.0-flash';

    // Try to get dynamic config from D1 if available
    if (db) {
        try {
            const dynamicProvider = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_PROVIDER').first<{ value: string }>();
            const dynamicModel = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_MODEL').first<{ value: string }>();
            if (dynamicProvider) providerType = dynamicProvider.value;
            if (dynamicModel) aiModel = dynamicModel.value;
        } catch (e) {
            console.warn('Failed to read dynamic config from D1, falling back to env:', e);
        }
    }

    if (providerType === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

        return new OpenAIProvider(
            apiKey,
            process.env.OPENAI_BASE_URL,
            aiModel
        );
    }

    // Default to Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    return new GeminiProvider(apiKey, aiModel);
}
