'use server';

import { getRequestContext } from "@cloudflare/next-on-pages";
import { revalidatePath } from "next/cache";

export async function updateAIConfig(formData: FormData) {
    const provider = formData.get('provider') as string;
    const model = formData.get('model') as string;
    const temperature = formData.get('temperature') as string;
    const system_prompt = formData.get('system_prompt') as string;

    const { env } = getRequestContext();
    const db = env.DB;

    try {
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_PROVIDER', provider).run();
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_MODEL', model).run();
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_TEMPERATURE', temperature).run();
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_SYSTEM_PROMPT', system_prompt).run();

        revalidatePath('/settings');
    } catch (e) {
        console.error(e);
    }
}
