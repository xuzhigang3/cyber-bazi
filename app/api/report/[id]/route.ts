import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { env } = getRequestContext();
    const report = await env.DB.prepare('SELECT * FROM reports WHERE id = ?').bind(id).first<any>();

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    if (!report.is_paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 403 });
    }

    // Return structure matching client-side expectation: { result, input }
    return NextResponse.json({
      result: {
        id: report.id,
        bazi: {
          year: report.bazi_year,
          month: report.bazi_month,
          day: report.bazi_day,
          hour: report.bazi_hour,
        },
        summary_zh: report.summary_zh,
        summary_en: report.summary_en,
        teaser_zh: report.teaser_zh,
        teaser_en: report.teaser_en,
        report_zh: report.full_report_zh,
        report_en: report.full_report_en,
        isPaid: true,
      },
      input: {
        name: report.name,
        gender: report.gender,
        date: report.date,
        time: report.time,
        location: report.location,
        email: report.email,
        language: report.lang,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
