import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const response = NextResponse.json({ success: true });

    response.cookies.set({
        name: 'admin_session',
        value: '',
        httpOnly: true,
        expires: new Date(0),
        path: '/'
    });

    return response;
}
