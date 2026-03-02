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
        const temperature = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_TEMPERATURE').first<{ value: string }>();
        const prompt = await db.prepare('SELECT value FROM configs WHERE key = ?').bind('AI_SYSTEM_PROMPT').first<{ value: string }>();

        return {
            provider: provider?.value || 'gemini',
            model: model?.value || 'gemini-2.0-flash',
            temperature: temperature?.value || '0.7',
            systemPrompt: prompt?.value || 'You are a professional Bazi (Four Pillars of Destiny) master...'
        };
    } catch (e) {
        console.error(e);
        return {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            temperature: '0.7',
            systemPrompt: 'You are a professional Bazi master...'
        };
    }
}

export default async function SettingsPage() {
    const config = await getCurrentConfig();

    return (
        <div className="max-w-4xl pb-12">
            <h1 className="text-2xl font-bold mb-8 text-slate-800">System Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-10">
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-bold text-slate-700">AI Provider & Routing</h2>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Hot Swap</span>
                    </div>

                    <form action={updateAIConfig} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Active Provider</label>
                                <select
                                    name="provider"
                                    defaultValue={config.provider}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 transition-all"
                                >
                                    <option value="gemini">Google Gemini</option>
                                    <option value="openai">OpenAI / DeepSeek (Compatible)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Model Name</label>
                                <input
                                    name="model"
                                    type="text"
                                    defaultValue={config.model}
                                    placeholder="e.g. gpt-4o, gemini-2.0-flash"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder:text-slate-300 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-600">Generation Temperature</label>
                                <span className="text-xs font-mono text-slate-400">Current: {config.temperature}</span>
                            </div>
                            <input
                                name="temperature"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                defaultValue={config.temperature}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>Precise (0)</span>
                                <span>Balanced (1)</span>
                                <span>Creative (2)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">System Prompt Preview</label>
                            <textarea
                                name="system_prompt"
                                rows={6}
                                defaultValue={config.systemPrompt}
                                className="w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm font-mono text-slate-600 leading-relaxed bg-slate-50/50"
                                placeholder="Enter the base AI personality and rules..."
                            />
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
