import { getRequestContext } from "@cloudflare/next-on-pages";
import { Activity, Clock, Cpu, DollarSign } from "lucide-react";

export const runtime = 'edge';

async function getUsageLogs() {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const logs = await db.prepare('SELECT * FROM ai_usage ORDER BY created_at DESC LIMIT 50').all<any>();
        const aggregates = await db.prepare(`
            SELECT 
                provider, 
                model, 
                COUNT(*) as count, 
                SUM(total_tokens) as tokens, 
                SUM(cost) as cost 
            FROM ai_usage 
            GROUP BY provider, model
        `).all<any>();

        return {
            logs: logs.results || [],
            aggregates: aggregates.results || []
        };
    } catch (e) {
        console.error(e);
        return { logs: [], aggregates: [] };
    }
}

export default async function UsagePage() {
    const { logs, aggregates } = await getUsageLogs();

    return (
        <div className="max-w-6xl pb-20">
            <h1 className="text-2xl font-bold mb-8">AI Usage & Cost Monitoring</h1>

            {/* Aggregates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {aggregates.map((agg: any) => (
                    <div key={`${agg.provider}-${agg.model}`} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-1">{agg.provider}</h3>
                                <p className="text-sm text-slate-500 font-mono">{agg.model}</p>
                            </div>
                            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Cpu size={18} />
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 text-xs">Total Requests</span>
                                <span className="font-bold">{agg.count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 text-xs">Total Tokens</span>
                                <span className="font-bold">{agg.tokens.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-50">
                                <span className="text-slate-400 text-xs">Estimated Cost</span>
                                <span className="font-bold text-red-600">${agg.cost.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        Recent Generation Requests
                    </h2>
                    <span className="text-xs text-slate-400">Showing last 50 records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Provider / Model</th>
                                <th className="px-6 py-4">Tokens (P/C/T)</th>
                                <th className="px-6 py-4">Est. Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700 uppercase leading-none mb-1">{log.provider}</div>
                                        <div className="text-[10px] font-mono text-slate-400">{log.model}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-700">{log.total_tokens.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {log.prompt_tokens} / {log.completion_tokens}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-red-500">
                                        ${log.cost.toFixed(5)}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                        No usage logs found yet. Start generating reports to see data here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
