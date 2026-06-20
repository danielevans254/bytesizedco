import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = 0; // counter reflects only real subscribers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID; // e.g. "pub_xxxxxxxx"
const beehiivOn = Boolean(API_KEY && PUB_ID);

// optional behaviour overrides
const WELCOME_EMAIL = process.env.BEEHIIV_WELCOME_EMAIL !== "false"; // default true
const DOUBLE_OPT = process.env.BEEHIIV_DOUBLE_OPT || "off"; // "on" | "off" | "not_set"
const COHORT = process.env.BEEHIIV_COHORT || "Founding Member";

/* ============================================================
   BEEHIIV (primary when env vars are set)
   ============================================================ */
async function beehiivSubscribe(email, interests) {
  const custom_fields = [
    { name: "Source", value: "Landing Waitlist" },
    { name: "Cohort", value: COHORT },
  ];
  if (interests) custom_fields.push({ name: "Interests", value: interests });

  return fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      reactivate_existing: false,
      send_welcome_email: WELCOME_EMAIL,
      double_opt_override: DOUBLE_OPT,
      utm_source: "landing",
      utm_medium: "waitlist",
      utm_campaign: "founding",
      referring_site: "bytesized.co",
      custom_fields,
    }),
  });
}

async function beehiivActiveCount() {
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}?expand[]=stats`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const n = json?.data?.stats?.active_subscriptions;
    return typeof n === "number" ? n : null;
  } catch {
    return null;
  }
}

/* ============================================================
   LOCAL FILE FALLBACK (when Beehiiv env vars are absent)
   ============================================================ */
const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "waitlist.json");

let chain = Promise.resolve();
function queue(task) {
  const run = chain.then(task, task);
  chain = run.then(() => undefined, () => undefined);
  return run;
}
async function readStore() {
  try {
    const json = JSON.parse(await fs.readFile(FILE, "utf8"));
    if (!Array.isArray(json.entries)) json.entries = [];
    return json;
  } catch {
    return { entries: [] };
  }
}
async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2));
}

/* ---- naive in-memory rate limit (per IP, per process) ---- */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 6;
}

/* ============================================================
   ROUTES
   ============================================================ */
export async function GET() {
  if (beehiivOn) {
    const count = await beehiivActiveCount();
    return NextResponse.json({
      total: count == null ? BASE : BASE + count,
      count: count ?? 0,
      source: "beehiiv",
    });
  }
  const store = await readStore();
  return NextResponse.json({
    total: BASE + store.entries.length,
    count: store.entries.length,
    source: "local",
  });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const email = String(body.email || "").trim().toLowerCase();
  const honeypot = String(body.website || "");
  const interests = Array.isArray(body.interests)
    ? body.interests.map((s) => String(s).trim()).filter(Boolean).slice(0, 10).join(", ")
    : "";

  // bot filled the hidden field → pretend success, store nothing
  if (honeypot) return NextResponse.json({ ok: true, total: BASE });

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Enter a valid email" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Slow down a sec" }, { status: 429 });
  }

  /* ---- Beehiiv path ---- */
  if (beehiivOn) {
    let res;
    try {
      res = await beehiivSubscribe(email, interests);
    } catch {
      return NextResponse.json({ ok: false, error: "Network error" }, { status: 502 });
    }
    if (res.ok) {
      const count = await beehiivActiveCount();
      const total = count == null ? null : BASE + count;
      return NextResponse.json({ ok: true, number: total, total });
    }
    let msg = "Something went wrong";
    try {
      const e = await res.json();
      msg = e?.errors?.[0]?.message || e?.message || msg;
    } catch {
      /* ignore */
    }
    const status = res.status >= 400 && res.status < 500 ? 400 : 502;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  /* ---- Local fallback path ---- */
  return queue(async () => {
    const store = await readStore();
    const existing = store.entries.find((e) => e.email === email);
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyJoined: true,
        number: existing.number,
        total: BASE + store.entries.length,
      });
    }
    const number = BASE + store.entries.length + 1;
    store.entries.push({ email, number, interests, createdAt: new Date().toISOString(), ip });
    await writeStore(store);
    return NextResponse.json({ ok: true, number, total: BASE + store.entries.length });
  });
}
