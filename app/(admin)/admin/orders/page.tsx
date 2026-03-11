import { getRequestContext } from "@cloudflare/next-on-pages";
import { FileText, CheckCircle, Clock } from "lucide-react";

import Link from "next/link";

export const runtime = 'edge';

async function getOrders(limit: number, offset: number) {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const totalQuery = await db.prepare('SELECT COUNT(*) as count FROM reports').first<any>();
        const total = totalQuery?.count || 0;

        const reports = await db
            .prepare('SELECT id, name, gender, email, is_paid, created_at FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?')
            .bind(limit, offset)
            .all<any>();
        return { orders: reports.results || [], total };
    } catch (e) {
        console.error(e);
        return { orders: [], total: 0 };
    }
}

export default async function OrdersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1', 10);
    const limit = 50;
    const offset = Math.max(0, (currentPage - 1) * limit);

    const { orders, total } = await getOrders(limit, offset);
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
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

                <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-sm">
                    <div className="text-slate-500">
                        Showing {Math.min(offset + 1, total)} to {Math.min(offset + limit, total)} of {total} entries
                    </div>
                    <div className="flex items-center gap-2">
                        {currentPage > 1 ? (
                            <Link href={`/admin/orders?page=${currentPage - 1}`} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                                Previous
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-1 border border-slate-200 rounded opacity-50 cursor-not-allowed">
                                Previous
                            </button>
                        )}
                        <span className="px-3 py-1 text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages ? (
                            <Link href={`/admin/orders?page=${currentPage + 1}`} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                                Next
                            </Link>
                        ) : (
                            <button disabled className="px-3 py-1 border border-slate-200 rounded opacity-50 cursor-not-allowed">
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
