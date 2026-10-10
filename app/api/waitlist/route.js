import { NextResponse } from "next/server";
import {
  beehiivOn,
  beehiivSubscribe,
  beehiivActiveCount,
  beehiivError,
  isAlreadySubscribed,
  cleanAttribution,
  sourceLabel,
} from "@/lib/integrations/beehiiv";
import { recordSignup, storeOn } from "@/lib/integrations/store";
import { clientIp, rateLimited } from "@/lib/ratelimit";
import { emailOn, sendEmail, sendAlert, waitlistWelcomeEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";
import { queue, readStore, writeStore } from "@/lib/waitlist/localStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = 0; // counter reflects only real subscribers

/* Signup confirmation via Resend. Best-effort and awaited, because a serverless
   function may be frozen the moment the response is returned. A send failure is
   logged for ops and never changes the answer the visitor gets. */
async function sendWelcome(email) {
  if (!emailOn) return;
  const sent = await sendEmail({ to: email, ...waitlistWelcomeEmail() });
  if (!sent.ok && !sent.skipped) console.error("[waitlist] confirmation email failed:", sent.error);
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

  if (!isValidEmail(email)) {
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
    } catch (e) {
      await sendAlert("waitlist: Beehiiv unreachable", { email, source, error: String(e?.message || e) });
      return NextResponse.json({ ok: false, error: "Network error" }, { status: 502 });
    }
    if (res.ok) {
      await sendWelcome(email);
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
    // A 5xx is Beehiiv's fault, not the visitor's, and loses the signup unless
    // Supabase caught it. A 4xx is usually a bad address and stays quiet.
    if (status === 502) {
      await sendAlert("waitlist: Beehiiv rejected a signup", { email, source, status: res.status, error: msg, savedToSupabase: storeOn });
    }
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
    if (persisted || storeOn) await sendWelcome(email);
    // Nothing captured the signup: no Beehiiv, no Supabase, no writable disk.
    // Answering ok:true here would drop the lead silently, which is worse than
    // asking the visitor to retry. Only claim success if something stored it.
    if (!persisted && !storeOn) {
      // The 2026-10-08 outage looked exactly like this: no Beehiiv env on Vercel.
      await sendAlert("waitlist: signup not stored anywhere", { email, source, beehiivOn, storeOn });
      return NextResponse.json(
        { ok: false, error: "Could not save your signup just now. Please try again shortly." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, number, total: BASE + store.entries.length });
  });
}
