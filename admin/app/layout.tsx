import type { Metadata } from "next";
import "./globals.css";
import { LayoutDashboard, ShoppingCart, Settings, Users, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cyber Bazi Admin",
    description: "Administrative dashboard for Cyber Bazi",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh">
            <body className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                    <div className="p-6 text-xl font-bold border-b border-slate-700 flex items-center gap-2">
                        <span className="text-blue-400">Cyber</span> Bazi Admin
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                            <ShoppingCart size={20} />
                            <span>Orders</span>
                        </Link>
                        <Link href="/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                            <Users size={20} />
                            <span>Users</span>
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                            <Settings size={20} />
                            <span>System Settings</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-700">
                        <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-900/50 text-red-400 transition-colors">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {children}
                </main>
            </body>
        </html>
    );
}
