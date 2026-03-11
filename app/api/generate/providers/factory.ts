import { IAIProvider } from './interface';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export async function getProvider(db?: any, env?: Record<string, string | undefined>): Promise<IAIProvider> {
    // In Cloudflare Pages Edge Runtime, env vars from the dashboard are in `env` context
    // process.env is a fallback for local development
    const getEnv = (key: string) => env?.[key] ?? process.env[key];

    let providerType = getEnv('AI_PROVIDER') || 'gemini';
    let aiModel = getEnv('AI_MODEL') || 'gemini-2.0-flash';
    let temperature = 0.7;
    let systemPrompt: string | undefined = undefined;

    // Try to get dynamic config from D1 if available
    if (db) {
        try {
            const { results } = await db.prepare(
                "SELECT key, value FROM configs WHERE key IN ('AI_PROVIDER', 'AI_MODEL', 'AI_TEMPERATURE', 'AI_SYSTEM_PROMPT')"
            ).all();

            if (results && results.length > 0) {
                const configMap = results.reduce((acc: any, row: any) => {
                    acc[row.key] = row.value;
                    return acc;
                }, {});

                if (configMap.AI_PROVIDER) providerType = configMap.AI_PROVIDER;
                if (configMap.AI_MODEL) aiModel = configMap.AI_MODEL;
                if (configMap.AI_TEMPERATURE) temperature = parseFloat(configMap.AI_TEMPERATURE);
                if (configMap.AI_SYSTEM_PROMPT) systemPrompt = configMap.AI_SYSTEM_PROMPT;
            }
        } catch (e) {
            console.warn('Failed to read dynamic config from D1, falling back to env:', e);
        }
    }

    let provider: IAIProvider;

    if (providerType === 'openai') {
        const apiKey = getEnv('OPENAI_API_KEY');
        if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

        provider = new OpenAIProvider(
            apiKey,
            getEnv('OPENAI_BASE_URL'),
            aiModel
        );
    } else {
        // Default to Gemini
        const apiKey = getEnv('GEMINI_API_KEY');
        if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

        provider = new GeminiProvider(apiKey, aiModel);
    }

    provider.config = {
        temperature,
        systemPrompt
    };

    return provider;
}
