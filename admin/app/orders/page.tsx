import { getRequestContext } from "@cloudflare/next-on-pages";
import { format } from "date-fns"; // Check if installed, if not will use vanilla
import { FileText, CheckCircle, Clock } from "lucide-react";

export const runtime = 'edge';

async function getOrders() {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const reports = await db
            .prepare('SELECT id, name, gender, email, is_paid, created_at FROM reports ORDER BY created_at DESC LIMIT 50')
            .all<any>();
        return reports.results || [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Report ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No records found.</td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{order.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium">{order.name}</div>
                                        <div className="text-xs text-slate-400">{order.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.is_paid === 1 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                <CheckCircle size={12} /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                            <FileText size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
