import { NextResponse } from "next/server";
import {
  beehiivOn,
  beehiivSubscribe,
  beehiivError,
  isAlreadySubscribed,
  cleanAttribution,
} from "../../lib/beehiiv";
import { recordPreorder, recordSignup } from "../../lib/store";
import { emailOn, sendEmail, preorderEmail } from "../../lib/email";
import { clientIp, rateLimited } from "../../lib/ratelimit";
import { FREE_SHIP } from "../../shop/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 50;

/* Line items arrive from the client cart, so treat every field as untrusted:
   clamp the shape, coerce the numbers, and recompute the totals here rather than
   believing the ones the browser sent.

   NOTE: prices are still taken from the request. That is fine while checkout takes
   no payment. The moment Stripe goes in, look every price up from products.js by
   slug and tier instead, or a crafted request buys a Founder edition for $1. */
function cleanItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((it) => ({
    slug: String(it?.slug || "").slice(0, 80),
    name: String(it?.name || "").slice(0, 120),
    tierLabel: String(it?.tierLabel || "").slice(0, 40),
    variant: String(it?.variant || "").slice(0, 120),
    qty: Math.max(1, Math.min(99, Math.trunc(Number(it?.qty) || 1))),
    price: Math.max(0, Math.min(100000, Number(it?.price) || 0)),
  }));
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 120);
  const address = String(body.address || "").trim().slice(0, 400);
  const honeypot = String(body.website || "");
  const attribution = cleanAttribution(body.attribution);
  const items = cleanItems(body.items);

  // bot filled the hidden field → pretend success, store nothing
  if (honeypot) return NextResponse.json({ ok: true });

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Enter a valid email" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Enter your name" }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ ok: false, error: "Your cart is empty" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Slow down a sec" }, { status: 429 });
  }

  const subtotal = items.reduce((n, it) => n + it.price * it.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : 6;
  const total = subtotal + shipping;

  // Our own copy first: a reservation is the most qualified lead on the site and
  // must survive any downstream failure.
  await recordPreorder({
    email,
    name,
    address: address || null,
    items,
    subtotal,
    shipping,
    total,
    attribution,
    ip,
  });
  await recordSignup({ email, source: "checkout", attribution, ip });

  // Add them to the list too, tagged as pre-order intent rather than a plain signup.
  let alreadyJoined = false;
  if (beehiivOn) {
    try {
      const res = await beehiivSubscribe(email, { attribution, source: "checkout" });
      if (!res.ok) {
        const msg = await beehiivError(res);
        alreadyJoined = isAlreadySubscribed(res.status, msg);
        if (!alreadyJoined) console.error("[preorder] beehiiv subscribe failed:", msg);
      }
    } catch (e) {
      // A list failure must not cost the reservation. Log and carry on.
      console.error("[preorder] beehiiv network error:", String(e?.message || e));
    }
  }

  // Confirmation from your own domain. Beehiiv does not send anything for this
  // action, so there is no double-email here.
  let emailed = false;
  if (emailOn) {
    const { subject, html, text } = preorderEmail({ name, items, total });
    const sent = await sendEmail({ to: email, subject, html, text });
    emailed = Boolean(sent.ok);
    if (!sent.ok && !sent.skipped) console.error("[preorder] confirmation email failed:", sent.error);
  }

  return NextResponse.json({ ok: true, alreadyJoined, emailed, total });
}
