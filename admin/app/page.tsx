import { getRequestContext } from "@cloudflare/next-on-pages";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export const runtime = 'edge';

async function getStats() {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const totalOrders = await db.prepare('SELECT COUNT(*) as count FROM reports').first<{ count: number }>();
        const paidOrders = await db.prepare('SELECT COUNT(*) as count FROM reports WHERE is_paid = 1').first<{ count: number }>();
        const totalUsers = await db.prepare('SELECT COUNT(DISTINCT email) as count FROM reports').first<{ count: number }>();

        // AI Usage Stats
        const aiStats = await db.prepare('SELECT SUM(total_tokens) as tokens, SUM(cost) as cost FROM ai_usage').first<{ tokens: number, cost: number }>();

        // Estimate GMV ($9.9 per report)
        const gmv = (paidOrders?.count || 0) * 9.9;

        return {
            totalOrders: totalOrders?.count || 0,
            paidOrders: paidOrders?.count || 0,
            totalUsers: totalUsers?.count || 0,
            gmv: gmv.toFixed(2),
            totalTokens: aiStats?.tokens || 0,
            totalCost: (aiStats?.cost || 0).toFixed(4)
        };
    } catch (e) {
        console.error(e);
        return { totalOrders: 0, paidOrders: 0, totalUsers: 0, gmv: "0.00", totalTokens: 0, totalCost: "0.0000" };
    }
}

export default async function DashboardPage() {
    const stats = await getStats();

    const cards = [
        { title: "Paid Orders", value: stats.paidOrders, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
        { title: "Total Tokens", value: stats.totalTokens.toLocaleString(), icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "AI Cost (USD)", value: `$${stats.totalCost}`, icon: DollarSign, color: "text-red-600", bg: "bg-red-100" },
        { title: "Est. GMV ($)", value: `$${stats.gmv}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`${card.bg} p-3 rounded-lg`}>
                            <card.icon className={card.color} size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                    <h2 className="text-lg font-bold mb-6">Cost Distribution</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Infrastructure (Cloudflare)</span>
                            <span className="font-bold text-green-600">Free Tier</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[100%]" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">AI Tokens (Estimated)</span>
                            <span className="font-bold text-red-600">${stats.totalCost}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full w-[15%]" />
                        </div>
                    </div>
                    <p className="mt-8 text-xs text-slate-400 italic">
                        * Costs are estimated based on current model pricing (Gemini 2.0 / OpenAI).
                        Actual billing may vary per provider.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                    <h2 className="text-lg font-bold mb-6">Platform Activity</h2>
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="text-4xl font-black text-slate-100 tracking-tighter uppercase opacity-50">Live Traffic</div>
                        <p className="text-slate-400 text-sm">Unique Users: {stats.totalUsers}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
