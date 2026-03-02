import { getRequestContext } from "@cloudflare/next-on-pages";
import { updateAIConfig } from "../actions/config";
import { Save, AlertCircle } from "lucide-react";

export const runtime = 'edge';

async function getCurrentConfig() {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const provider = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_PROVIDER').first<{ value: string }>();
        const model = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_MODEL').first<{ value: string }>();
        return {
            provider: provider?.value || 'gemini',
            model: model?.value || 'gemini-2.0-flash'
        };
    } catch (e) {
        console.error(e);
        return { provider: 'gemini', model: 'gemini-2.0-flash' };
    }
}

export default async function SettingsPage() {
    const config = await getCurrentConfig();

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-8">System Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-bold">AI Provider Routing</h2>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">Hot Swap</span>
                    </div>

                    <form action={updateAIConfig} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Active Provider</label>
                                <select
                                    name="provider"
                                    defaultValue={config.provider}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="gemini">Google Gemini</option>
                                    <option value="openai">OpenAI / DeepSeek (Compatible)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Model Name</label>
                                <input
                                    name="model"
                                    type="text"
                                    defaultValue={config.model}
                                    placeholder="e.g. gpt-4o, gemini-2.0-flash"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm">
                            <AlertCircle size={18} className="text-blue-500 shrink-0" />
                            <p>Changes will apply immediately to the main site <strong>cyber-bazi.pages.dev</strong> through shared D1 configuration.</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                            >
                                <Save size={18} /> Update Settings
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-slate-100" />

                <section>
                    <h2 className="text-lg font-bold mb-4">Platform Config</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="opacity-50 pointer-events-none">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Lemon Squeezy Variant ID</label>
                            <input type="text" value="384920" readOnly className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50" />
                        </div>
                        <div className="opacity-50 pointer-events-none">
                            <label className="block text-sm font-medium text-slate-700 mb-2">AdSense Client ID</label>
                            <input type="text" value="pub-98xxxxxx" readOnly className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
