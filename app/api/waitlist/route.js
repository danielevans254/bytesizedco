import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  beehiivOn,
  beehiivSubscribe,
  beehiivActiveCount,
  beehiivError,
  isAlreadySubscribed,
  cleanAttribution,
  sourceLabel,
} from "../../lib/beehiiv";
import { recordSignup, storeOn } from "../../lib/store";
import { clientIp, rateLimited } from "../../lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = 0; // counter reflects only real subscribers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
/* Reports failure instead of throwing. This fallback is a dev convenience, but it
   also runs in production whenever the Beehiiv env vars are absent, and on Vercel
   everything outside /tmp is read-only. An uncaught EROFS here 500s the request and
   takes the whole waitlist down, which is exactly what happened on 2026-10-08. */
async function writeStore(store) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(store, null, 2));
    return true;
  } catch (e) {
    console.error(
      "[waitlist] cannot persist signup: Beehiiv is not configured and the filesystem is read-only. " +
        "Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in this environment.",
      String(e?.message || e)
    );
    return false;
  }
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
  const source = String(body.source || "landing");

  // bot filled the hidden field → pretend success, store nothing
  if (honeypot) return NextResponse.json({ ok: true, total: BASE });

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Enter a valid email" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Slow down a sec" }, { status: 429 });
  }

  await recordSignup({ email, source, interests, attribution, ip });

  /* ---- Beehiiv path ---- */
  if (beehiivOn) {
    let res;
    try {
      res = await beehiivSubscribe(email, { interests, attribution, source });
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
    const msg = await beehiivError(res);
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
      source: sourceLabel(source),
      attribution,
      createdAt: new Date().toISOString(),
      ip,
    });
    const persisted = await writeStore(store);
    // Nothing captured the signup: no Beehiiv, no Supabase, no writable disk.
    // Answering ok:true here would drop the lead silently, which is worse than
    // asking the visitor to retry. Only claim success if something stored it.
    if (!persisted && !storeOn) {
      return NextResponse.json(
        { ok: false, error: "Could not save your signup just now. Please try again shortly." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, number, total: BASE + store.entries.length });
  });
}
