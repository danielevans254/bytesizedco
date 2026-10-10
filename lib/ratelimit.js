/* Naive in-memory rate limit, per IP, per process.

   NOTE: this silently no-ops on serverless, because every invocation is a fresh
   process with an empty Map. Move it to a shared store (Upstash / Vercel KV)
   before relying on it in production. Tracked in docs/AUDIT-FIXES.md. */

const hits = new Map();

export function clientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export function rateLimited(ip, { limit = 6, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  // Evict IPs whose window has fully expired so the Map can't grow unbounded
  // over the process lifetime.
  for (const [k, ts] of hits) {
    if (ts.length === 0 || now - ts[ts.length - 1] >= windowMs) hits.delete(k);
  }
  return arr.length > limit;
}
