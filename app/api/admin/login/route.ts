import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin888';

        if (password === correctPassword) {
            const response = NextResponse.json({ success: true });

            // Generate a simple token (in a real app, use JWT)
            // Here we use a secure HttpOnly cookie with a static value for simplicity,
            // as this is a single-admin system protected by a password environment variable.
            response.cookies.set({
                name: 'admin_session',
                value: 'authenticated',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return response;
        }

        return NextResponse.json(
            { success: false, error: 'Invalid password' },
            { status: 401 }
        );
    } catch (e) {
        return NextResponse.json(
            { success: false, error: 'Bad request' },
            { status: 400 }
        );
    }
}
