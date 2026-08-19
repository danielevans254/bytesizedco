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

/* ---- attribution ----
   The client sends the UTMs it captured on landing. Treat it as untrusted input:
   keep only the fields we asked for, clamp their length, and fall back to the
   old constants when a visitor arrives with no campaign tagging at all.

   These ride on Beehiiv's own utm_* params rather than custom fields, so no new
   custom field has to exist in the publication for a subscribe to succeed. */
const ATTR_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer"];
const DEFAULT_UTM = { source: "direct", medium: "waitlist", campaign: "founding" };

// Which form produced the signup. Mapped server-side from a short key so the
// client can never write an arbitrary value into the Beehiiv record.
const SOURCE_LABELS = {
  landing: "Landing Waitlist",
  checkout: "Demo Checkout Intent",
};

function cleanAttribution(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const k of ATTR_FIELDS) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return out;
}

/* ============================================================
   BEEHIIV (primary when env vars are set)
   ============================================================ */
async function beehiivSubscribe(email, interests, attribution, sourceLabel) {
  const custom_fields = [
    { name: "Source", value: sourceLabel },
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
      utm_source: attribution.utm_source || DEFAULT_UTM.source,
      utm_medium: attribution.utm_medium || DEFAULT_UTM.medium,
      utm_campaign: attribution.utm_campaign || DEFAULT_UTM.campaign,
      ...(attribution.utm_term ? { utm_term: attribution.utm_term } : {}),
      ...(attribution.utm_content ? { utm_content: attribution.utm_content } : {}),
      referring_site: attribution.referrer || "bytesized.co",
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

/* ---- naive in-memory rate limit (per IP, per process) ----
   NOTE: per-process + in-memory, so it silently no-ops on serverless (each
   invocation is a fresh process). Move to a shared store (Upstash/Vercel KV)
   before relying on it in production. */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  // Evict IPs whose window has fully expired so the Map can't grow unbounded
  // over the process lifetime.
  for (const [k, ts] of hits) {
    if (ts.length === 0 || now - ts[ts.length - 1] >= 60_000) hits.delete(k);
  }
  return arr.length > 6;
}

// Heuristic: does a failed Beehiiv subscribe mean "this email is already
// subscribed"? We keep reactivate_existing:false (don't resurrect people who
// unsubscribed), but a duplicate signup should read as success, not a red error.
function isAlreadySubscribed(status, msg) {
  if (status === 409) return true;
  const m = String(msg || "").toLowerCase();
  return m.includes("already") || m.includes("exists") || m.includes("duplicate");
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
  const attribution = cleanAttribution(body.attribution);
  const sourceLabel = SOURCE_LABELS[String(body.source || "landing")] || SOURCE_LABELS.landing;

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
      res = await beehiivSubscribe(email, interests, attribution, sourceLabel);
    } catch {
      return NextResponse.json({ ok: false, error: "Network error" }, { status: 502 });
    }
    if (res.ok) {
      const count = await beehiivActiveCount();
      const total = count == null ? null : BASE + count;
      // Beehiiv exposes no per-subscriber position, so we can't honestly show a
      // personal "#N" rank here. Return only the global total for the counter;
      // number:null makes the UI say "You're on the list" instead of faking a rank.
      return NextResponse.json({ ok: true, number: null, total });
    }
    let msg = "Something went wrong";
    try {
      const e = await res.json();
      msg = e?.errors?.[0]?.message || e?.message || msg;
    } catch {
      /* ignore */
    }
    // A returning subscriber is not a failure. Show "already in", not a red error.
    if (isAlreadySubscribed(res.status, msg)) {
      const count = await beehiivActiveCount();
      const total = count == null ? null : BASE + count;
      return NextResponse.json({ ok: true, alreadyJoined: true, number: null, total });
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
    store.entries.push({
      email,
      number,
      interests,
      source: sourceLabel,
      attribution,
      createdAt: new Date().toISOString(),
      ip,
    });
    await writeStore(store);
    return NextResponse.json({ ok: true, number, total: BASE + store.entries.length });
  });
}
