'use client';

import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
        >
            <LogOut size={20} />
            <span>Logout</span>
        </button>
    );
}
