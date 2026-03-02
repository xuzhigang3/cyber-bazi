// Cloudflare D1 database type helper
// D1 binding is injected via the `env` object in each API Route handler.
// This file re-exports the D1 type for use in route handlers.

export type D1Database = import('@cloudflare/workers-types').D1Database;

// Helper: get the D1 binding from Next.js route handler context
// Usage: const db = getD1(request)
export function getD1(request: Request): D1Database {
  // @ts-expect-error - Cloudflare injects this onto the request
  const db = request.cf?.env?.DB ?? (globalThis as any).__D1_BINDING__;
  if (!db) {
    throw new Error('D1 database binding not found. Make sure DB binding is configured in wrangler.toml.');
  }
  return db;
}
