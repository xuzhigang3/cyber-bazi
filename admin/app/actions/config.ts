'use server';

import { getRequestContext } from "@cloudflare/next-on-pages";
import { revalidatePath } from "next/cache";

export async function updateAIConfig(formData: FormData) {
    const provider = formData.get('provider') as string;
    const model = formData.get('model') as string;

    const { env } = getRequestContext();
    const db = env.DB;

    try {
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_PROVIDER', provider).run();
        await db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').bind('AI_MODEL', model).run();

        revalidatePath('/settings');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed to update config' };
    }
}
