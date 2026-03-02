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

        // Estimate GMV ($9.9 per report)
        const gmv = (paidOrders?.count || 0) * 9.9;

        return {
            totalOrders: totalOrders?.count || 0,
            paidOrders: paidOrders?.count || 0,
            totalUsers: totalUsers?.count || 0,
            gmv: gmv.toFixed(2),
        };
    } catch (e) {
        console.error(e);
        return { totalOrders: 0, paidOrders: 0, totalUsers: 0, gmv: "0.00" };
    }
}

export default async function DashboardPage() {
    const stats = await getStats();

    const cards = [
        { title: "Total Reports", value: stats.totalOrders, icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Paid Orders", value: stats.paidOrders, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
        { title: "Unique Users", value: stats.totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                    <h2 className="text-lg font-bold mb-4">AI Usage Efficiency</h2>
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Chart Placeholder (AI Token Consumption)
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
                    <h2 className="text-lg font-bold mb-4">Recent Reach</h2>
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Chart Placeholder (Visitor Origins)
                    </div>
                </div>
            </div>
        </div>
    );
}
