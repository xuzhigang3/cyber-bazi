import { getRequestContext } from "@cloudflare/next-on-pages";
import { User, Activity, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export const runtime = 'edge';

async function getUsers(limit: number, offset: number) {
    const { env } = getRequestContext();
    const db = env.DB;

    try {
        const totalQuery = await db.prepare("SELECT COUNT(DISTINCT email) as count FROM reports WHERE email IS NOT NULL AND email != ''").first<any>();
        const total = totalQuery?.count || 0;

        const users = await db
            .prepare(`
                SELECT 
                    email, 
                    MAX(name) as name, 
                    COUNT(id) as total_reports, 
                    SUM(is_paid) as total_paid, 
                    MAX(created_at) as last_activity 
                FROM reports 
                WHERE email IS NOT NULL AND email != '' 
                GROUP BY email 
                ORDER BY last_activity DESC 
                LIMIT ? OFFSET ?
            `)
            .bind(limit, offset)
            .all<any>();

        return { users: users.results || [], total };
    } catch (e) {
        console.error(e);
        return { users: [], total: 0 };
    }
}

export default async function UsersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1', 10);
    const limit = 50;
    const offset = Math.max(0, (currentPage - 1) * limit);

    const { users, total } = await getUsers(limit, offset);
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">User Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">User Details</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Reports</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paid Reports</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Last Activity</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user: any, index: number) => (
                                    <tr key={user.email || index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{user.name || 'Anonymous User'}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Mail size={10} /> {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                <Activity size={12} /> {user.total_reports}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                <CheckCircle size={12} /> {user.total_paid}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.last_activity).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                                <Mail size={16} /> Contact
                                            </a>
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
                            <Link href={`/admin/users?page=${currentPage - 1}`} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
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
                            <Link href={`/admin/users?page=${currentPage + 1}`} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
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
