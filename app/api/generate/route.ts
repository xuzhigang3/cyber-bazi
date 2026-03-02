import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from '@google/genai';
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

    // --- AI generation (server-side only, key not exposed to client) ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const prompt = getDefaultPrompt(langInstruction, data, lang);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0,
        topP: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bazi: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING },
                month: { type: Type.STRING },
                day: { type: Type.STRING },
                hour: { type: Type.STRING },
              },
              required: ['year', 'month', 'day', 'hour'],
            },
            summary: { type: Type.STRING },
            report: { type: Type.STRING },
          },
          required: ['bazi', 'summary', 'report'],
        },
      },
    });

    if (!response.text) throw new Error('Failed to generate report');
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
    else if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    const result = JSON.parse(jsonStr.trim());

    // --- Save to D1 ---
    const { env } = getRequestContext();
    const db = env.DB;

    const id = uuidv4();
    const reportText = result.report || '';
    const teaser = reportText.substring(0, 200) + (reportText.length > 200 ? '\n\n...' : '');

    await db
      .prepare(
        `INSERT INTO reports (id, name, gender, date, time, location, email, bazi_year, bazi_month, bazi_day, bazi_hour, summary, teaser, full_report, is_paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
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
        result.report
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
