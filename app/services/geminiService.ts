// Client-side service: only calls Next.js API routes.
// All AI processing happens server-side in /api/generate.

export interface BaziInput {
  name: string;
  gender: 'male' | 'female';
  date: string;
  time: string;
  location: string;
  email: string;
  language?: 'zh' | 'en';
}

export interface BaziResult {
  id: string;
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  summary: string;
  teaser?: string;
  report?: string;
  isPaid?: boolean;
}

export async function generateBaziReport(data: BaziInput): Promise<BaziResult> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error || 'Failed to generate report');
  }
  return res.json() as Promise<BaziResult>;
}

export async function getFullReport(id: string): Promise<{ result: BaziResult; input: BaziInput }> {
  const res = await fetch(`/api/report/${id}`);
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error || 'Failed to fetch report');
  }
  return res.json() as Promise<{ result: BaziResult; input: BaziInput }>;
}

export async function checkout(id: string, email: string): Promise<{ url: string }> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, email }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error || 'Checkout failed');
  }
  return (await res.json()) as { url: string };
}
