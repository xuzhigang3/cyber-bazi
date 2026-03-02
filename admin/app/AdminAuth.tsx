'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const auth = localStorage.getItem('admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Fallback for demo/local or use env variable
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin888';

        if (password === correctPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('admin_auth', 'true');
            setError('');
        } else {
            setError('密码错误，请重试');
        }
    };

    if (!isMounted) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="text-blue-400 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Cyber Bazi 管理后台</h1>
                        <p className="text-slate-400 text-sm mt-2 text-center">请输入管理员密码以继续访问</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="管理员密码"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                            登录系统
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-xs">安全提示：建议定期更换管理密码并开启 Cloudflare Access</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
