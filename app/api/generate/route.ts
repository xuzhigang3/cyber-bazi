import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultPrompt } from '../../../prompt.config';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { BaziInput } from '../../services/geminiService';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as BaziInput;
    const lang = data.language || 'zh';
    const langInstruction =
      lang === 'en'
        ? 'Please generate the report in English, but keep it professionally bilingual. For all technical Chinese Bazi terms (such as Tiangan, Dizhi, Wuxing, Ten Gods, etc.), provide the English translation/Pinyin first, followed by the original Chinese characters in parentheses. Ensure the tone is elegant and traditional.'
        : '请用中文生成报告。对于报告中比较生涩的命理专业术语（如：七杀、伤官、空亡、伏吟等），请务必在括号内加上通俗易懂的白话释义，让普通用户也能轻松看懂。';

    // --- Idempotency Check ---
    const hashInput = JSON.stringify({
      name: data.name,
      gender: data.gender,
      date: data.date,
      time: data.time,
      location: data.location,
      email: data.email,
      lang
    });

    // Simple hash function for Edge Runtime (using SubtleCrypto)
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashInput));
    const inputHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { env } = getRequestContext();
    const db = env.DB;

    // Check if a paid report with the same input already exists
    const existingPaid = await db
      .prepare('SELECT id, bazi_year, bazi_month, bazi_day, bazi_hour, summary, teaser FROM reports WHERE input_hash = ? AND is_paid = 1 LIMIT 1')
      .bind(inputHash)
      .first<any>();

    if (existingPaid) {
      return NextResponse.json({
        id: existingPaid.id,
        bazi: {
          year: existingPaid.bazi_year,
          month: existingPaid.bazi_month,
          day: existingPaid.bazi_day,
          hour: existingPaid.bazi_hour,
        },
        summary: existingPaid.summary,
        teaser: existingPaid.teaser,
        reused: true
      });
    }

    // --- AI generation (server-side only, key not exposed to client) ---
    const prompt = getDefaultPrompt(langInstruction, data, lang);

    const { getProvider } = await import('./providers/factory');
    const provider = await getProvider(db);
    const result = await provider.generateContent(prompt);

    // --- Save to D1 ---
    const id = uuidv4();
    const reportText = result.report || '';
    const teaser = reportText.substring(0, 200) + (reportText.length > 200 ? '\n\n...' : '');

    await db
      .prepare(
        `INSERT INTO reports (id, name, gender, date, time, location, email, bazi_year, bazi_month, bazi_day, bazi_hour, summary, teaser, full_report, is_paid, input_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
      )
      .bind(
        id,
        data.name,
        data.gender,
        data.date,
        data.time,
        data.location,
        data.email,
        result.bazi.year,
        result.bazi.month,
        result.bazi.day,
        result.bazi.hour,
        result.summary,
        teaser,
        result.report,
        inputHash
      )
      .run();

    return NextResponse.json({
      id,
      bazi: result.bazi,
      summary: result.summary,
      teaser,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
