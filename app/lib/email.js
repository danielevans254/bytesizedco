/* Transactional email via Resend, sent from your own domain.

   Scope: every system email. Beehiiv carries only the newsletter and the
   product-catalog verticals; signup confirmations, billing and order updates,
   account notices, alerts, fraud and support mail all go through here, so a landing
   signup sends exactly one message and it comes from Resend, not Beehiiv.

   Hand-rolled fetch against the REST endpoint rather than the SDK, to keep the app
   at three dependencies. Best-effort: a mail failure must never cost a signup. */

import { SITE_URL } from "../site";

// Bare host for display in copy. Derived from SITE_URL so the domain cannot
// drift: this footer used to name "bytesized.co", which we do not own.
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/* Google Groups on the root domain. Mail is sent from EMAIL_FROM on the
   Resend-verified root domain, but replies go to a group a human reads, so each
   template picks the group that owns its replies. Derived from SITE_HOST like
   the footer; a preview deploy with a different host should set EMAIL_REPLY_TO. */
const MAIL_DOMAIN = SITE_HOST.replace(/^www\./, "");
export const GROUPS = {
  support: `support@${MAIL_DOMAIN}`, // reservations, orders, anything a customer replies to
  billing: `billing@${MAIL_DOMAIN}`, // receipts and charges
  alerts: `alerts@${MAIL_DOMAIN}`, // internal ops notices, never customer-facing
};

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM; // e.g. "Byte Sized Co. <hello@bytesizedco.com>"
const REPLY_TO = process.env.EMAIL_REPLY_TO || GROUPS.support;
const POSTAL = process.env.COMPANY_POSTAL_ADDRESS;

export const emailOn = Boolean(KEY && FROM);

export async function sendEmail({ to, subject, html, text, replyTo = REPLY_TO }) {
  if (!emailOn) return { ok: false, skipped: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/* Ops notice to the alerts@ group. Never throws and never blocks the caller's
   answer on its own failure: an alert that cannot send is logged and dropped. */
export async function sendAlert(event, detail = {}) {
  const { subject, html, text } = alertEmail({ event, detail });
  const sent = await sendEmail({ to: GROUPS.alerts, subject, html, text, replyTo: null });
  if (!sent.ok && !sent.skipped) console.error("[alert] could not send:", sent.error);
  return sent;
}

/* ---- templates ----
   Brand rules apply to this copy exactly as they do on the site: no em-dashes, no
   emoji, dark palette, one accent. Inline styles only, because email clients strip
   <style> blocks. */

const BG = "#08090B";
const SURFACE = "#0C0E11";
const LINE = "#1C2027";
const TEXT = "#F4F6F9";
const MUTED = "#8B929E";
const ACCENT = "#6BFFA8";

function money(n) {
  return `$${Number(n || 0)}`;
}

/* One shell for every customer-facing message, so the frame cannot drift
   between templates. `label` is the small accent kicker, `note` is the line in
   the footer that says why this email was sent. */
function shell({ label, heading, body, note }) {
  // CAN-SPAM: a transactional message is exempt from the unsubscribe requirement,
  // but a real postal address is still the safe default. Set
  // COMPANY_POSTAL_ADDRESS once the LLC has a registered address.
  const addr = POSTAL
    ? `<div style="color:${MUTED};font-size:11px;line-height:1.6;margin-top:14px">${escapeHtml(POSTAL)}</div>`
    : "";
  return `<div style="background:${BG};padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:${SURFACE};border:1px solid ${LINE};border-radius:16px;padding:32px">
    <div style="color:${ACCENT};font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:600">// ${label}</div>
    <h1 style="color:${TEXT};font-size:26px;line-height:1.25;margin:14px 0 0;font-weight:700">${heading}</h1>
    ${body}
    <div style="border-top:1px solid ${LINE};margin-top:28px;padding-top:18px">
      <div style="color:${MUTED};font-size:12px;line-height:1.6">${note}</div>${addr}
    </div>
  </div>
</div>`;
}

function para(html, top = 14) {
  return `<p style="color:${MUTED};font-size:15px;line-height:1.65;margin:${top}px 0 0">${html}</p>`;
}

function firstName(name) {
  return String(name || "").trim().split(" ")[0] || "friend";
}

function itemRows(items) {
  return items
    .map(
      (it) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${TEXT};font-size:14px">
          ${escapeHtml(it.name)}
          <span style="color:${MUTED}"> ${escapeHtml(it.tierLabel || "")}${it.variant ? ` / ${escapeHtml(it.variant)}` : ""}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:14px;text-align:right;white-space:nowrap">
          ${it.qty || 1} x ${money(it.price)}
        </td>
      </tr>`
    )
    .join("");
}

function itemTable(items, totalLabel, total) {
  return `<table style="width:100%;border-collapse:collapse;margin-top:24px">${itemRows(items)}
      <tr>
        <td style="padding:14px 0 0;color:${TEXT};font-size:15px;font-weight:700">${totalLabel}</td>
        <td style="padding:14px 0 0;color:${ACCENT};font-size:15px;font-weight:700;text-align:right">${money(total)}</td>
      </tr>
    </table>`;
}

function itemLines(items) {
  return items.map((it) => `- ${it.name} ${it.tierLabel || ""} x${it.qty || 1}  ${money(it.price)}`);
}

// Label / value rows, e.g. order number, edition, tracking. Values in mono so
// codes and numbers read as data.
function kvTable(rows) {
  return `<table style="width:100%;border-collapse:collapse;margin-top:24px">${rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 16px 10px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${TEXT};font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-all">${escapeHtml(v)}</td>
      </tr>`
    )
    .join("")}</table>`;
}

// The one accent-filled element in a message. One per email at most.
function button(href, label) {
  return `<div style="margin-top:28px"><a href="${escapeHtml(href)}" style="display:inline-block;background:${ACCENT};color:${BG};font-size:14px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">${escapeHtml(label)}</a></div>`;
}

/* Shared builder for the lifecycle notices below: plain-text paragraphs, an
   optional row table and an optional button, rendered to both HTML and text so
   the two versions cannot say different things. */
function notice({ subject, label, heading, paras = [], rows = [], cta, after = [], note, replyTo = GROUPS.support }) {
  const html = shell({
    label,
    heading: escapeHtml(heading),
    body: [
      ...paras.map((p) => para(escapeHtml(p))),
      rows.length ? kvTable(rows) : "",
      cta ? button(cta.href, cta.label) : "",
      ...after.map((p, i) => para(escapeHtml(p), i === 0 ? 24 : 14)),
    ]
      .filter(Boolean)
      .join("\n    "),
    note,
  });

  const text = [
    label,
    "",
    heading,
    "",
    ...paras.flatMap((p) => [p, ""]),
    ...rows.map(([k, v]) => `${k}: ${v}`),
    rows.length ? "" : null,
    cta ? `${cta.label}: ${cta.href}` : null,
    cta ? "" : null,
    ...after.flatMap((p) => [p, ""]),
    POSTAL || "",
  ]
    .filter((l) => l !== null)
    .join("\n")
    .trim();

  return { subject, html, text, replyTo };
}

/* Waitlist signup confirmation. One message per new subscriber, sent by the
   waitlist route right after Beehiiv accepts the address. Beehiiv's own welcome
   email stays off (BEEHIIV_WELCOME_EMAIL) so nobody gets two. Replies go to support@. */
export function waitlistWelcomeEmail() {
  return notice({
    subject: "You're on the list",
    label: "// ON THE LIST",
    heading: "You're in.",
    paras: [
      "Thanks for joining the Byte Sized Co. list. Every drop is numbered and capped, and the list hears about each one before anyone else.",
      "There is nothing to do right now. Newsletter issues and product news arrive separately; this message only confirms your spot.",
    ],
    after: ["Questions? Reply to this email and a person answers."],
    note: `You are receiving this because you joined the list on ${SITE_HOST}. This is a one-time confirmation, not the newsletter.`,
  });
}

const ORDER_NOTE = `You are receiving this because you have an order or reservation on ${SITE_HOST}. This is a transactional message, not marketing.`;

/* Reservation confirmation for the pre-order form. Replies go to support@.

   Deliberately does NOT say "order confirmed" or imply money changed hands: the
   checkout takes no payment today, and the email must not claim otherwise. */
export function preorderEmail({ name, items = [], total }) {
  const first = firstName(name);

  const html = shell({
    label: "RESERVED",
    heading: "Your spot is held.",
    body: [
      para(`Thanks, ${escapeHtml(first)}. Nothing has been charged. This is a reservation for Drop 001,
      and we will email you before anything ships.`),
      itemTable(items, "Reserved total", total),
      para(`Each release clearly states whether it is digital, physical, or paired.
      Questions about your reservation? Reply to this email and it reaches a person.`, 24),
    ].join("\n    "),
    note: `You are receiving this because you reserved a spot on ${SITE_HOST}.
      This is a transactional message about that reservation, not marketing.`,
  });

  const text = [
    "RESERVED",
    "",
    "Your spot is held.",
    "",
    `Thanks, ${first}. Nothing has been charged. This is a reservation for Drop 001, and we will email you before anything ships.`,
    "",
    ...itemLines(items),
    "",
    `Reserved total: ${money(total)}`,
    "",
    "Each release clearly states whether it is digital, physical, or paired. Questions about your reservation? Reply to this email and it reaches a person.",
    "",
    POSTAL || "",
  ]
    .join("\n")
    .trim();

  return { subject: "Your Drop 001 reservation", html, text, replyTo: GROUPS.support };
}

/* Payment receipt. Replies go to billing@.

   NOT WIRED: nothing calls this until Stripe exists. Call it from the payment
   webhook only, with amounts read from the Stripe event, never from the request
   body (see the preorder price note in CLAUDE.md). */
export function receiptEmail({ name, items = [], total, orderId, paidAt = new Date() }) {
  const first = firstName(name);
  const date = new Date(paidAt).toISOString().slice(0, 10);
  const ref = escapeHtml(orderId || "");

  const html = shell({
    label: "RECEIPT",
    heading: "Payment received.",
    body: [
      para(`Thanks, ${escapeHtml(first)}. This is your receipt for order
      <span style="color:${TEXT};font-family:ui-monospace,Menlo,Consolas,monospace">${ref}</span>, paid ${date}.`),
      itemTable(items, "Total paid", total),
      para(`We will email again when it ships. Questions about a charge? Reply here and it reaches billing.`, 24),
    ].join("\n    "),
    note: `You are receiving this because you placed an order on ${SITE_HOST}.
      Keep it for your records.`,
  });

  const text = [
    "RECEIPT",
    "",
    "Payment received.",
    "",
    `Thanks, ${first}. This is your receipt for order ${orderId || ""}, paid ${date}.`,
    "",
    ...itemLines(items),
    "",
    `Total paid: ${money(total)}`,
    "",
    "We will email again when it ships. Questions about a charge? Reply here and it reaches billing.",
    "",
    POSTAL || "",
  ]
    .join("\n")
    .trim();

  return { subject: `Receipt for order ${orderId || ""}`.trim(), html, text, replyTo: GROUPS.billing };
}

/* ---- order lifecycle ----
   NOT WIRED: nothing calls these until Stripe and fulfilment exist. The milestone
   set (open, in production, delay, shipped, delivered) follows the "over-
   communicate delays" rule in the operations notes: tell people before a date
   slips, never after. Each has a dashboard twin in Resend with the same copy. */

const amountText = (n) => (typeof n === "number" ? money(n) : String(n ?? ""));

/* The drop opened and a reservation can now be paid. Founders get this first. */
export function checkoutOpenEmail({ name, drop, tier, checkoutUrl, closesAt }) {
  return notice({
    subject: `${drop} is open. Your spot is waiting.`,
    label: "OPEN",
    heading: "Your spot is waiting.",
    paras: [
      `${firstName(name)}, ${drop} is open and your reservation comes first. Complete checkout before ${closesAt} to keep it.`,
      "After that, unclaimed spots go to the waitlist.",
    ],
    rows: [["Drop", drop], ["Tier", tier], ["Window closes", closesAt]],
    cta: { href: checkoutUrl, label: "Complete checkout" },
    after: ["Changed your mind? Reply and we will release it. Nothing is charged unless you check out."],
    note: ORDER_NOTE,
  });
}

/* Paid, and the drop is being made. Sets the padded ship window. */
export function inProductionEmail({ name, drop, orderId, eta }) {
  return notice({
    subject: `${drop} is in production`,
    label: "IN PRODUCTION",
    heading: "It's being made.",
    paras: [
      `${firstName(name)}, your order is paid and ${drop} is now in production.`,
      "We pad every date, so the window below is the honest one. If it moves, you hear from us before it does.",
    ],
    rows: [["Order", orderId], ["Drop", drop], ["Expected to ship", eta]],
    note: ORDER_NOTE,
  });
}

/* A ship date moved. Send it as soon as the slip is known, with a way out. */
export function delayEmail({ name, drop, orderId, oldEta, newEta, reason }) {
  return notice({
    subject: `${drop}: new ship date`,
    label: "DELAY",
    heading: "A delay, stated plainly.",
    paras: [`${firstName(name)}, ${drop} will ship later than we said.`, reason, "Your order and your edition number are unchanged."],
    rows: [["Order", orderId], ["Was", oldEta], ["Now", newEta]],
    after: ["If the new date does not work for you, reply and we will refund you in full."],
    note: ORDER_NOTE,
  });
}

/* Left the building. The numbered card ships in the box. */
export function shippedEmail({ name, drop, orderId, edition, carrier, trackingNumber, trackingUrl }) {
  return notice({
    subject: `${drop} shipped`,
    label: "SHIPPED",
    heading: "It's on the way.",
    paras: [`${firstName(name)}, your order left today.`],
    rows: [["Order", orderId], ["Edition", edition], ["Carrier", carrier], ["Tracking", trackingNumber]],
    cta: { href: trackingUrl, label: "Track package" },
    after: ["Your numbered card is in the box. Keep it: it is the key to your digital companion."],
    note: ORDER_NOTE,
  });
}

/* Arrived. Points at the card as the key to the companion. */
export function deliveredEmail({ name, drop, edition, unlockUrl }) {
  return notice({
    subject: `${drop} arrived`,
    label: "DELIVERED",
    heading: "It landed.",
    paras: [
      `${firstName(name)}, tracking says your order arrived.`,
      "Find the numbered card in the box. Tap it with your phone, or enter its code at the link below, to open your digital companion.",
    ],
    rows: [["Edition", edition]],
    cta: { href: unlockUrl, label: "Open your companion" },
    after: ["Something missing or damaged? Reply with a photo and we will make it right."],
    note: ORDER_NOTE,
  });
}

/* Digital-only orders: no box, so the code arrives by email. */
export function companionEmail({ name, drop, edition, unlockCode, unlockUrl }) {
  return notice({
    subject: `Your ${drop} companion`,
    label: "UNLOCKED",
    heading: "Your companion is ready.",
    paras: [`${firstName(name)}, your digital companion for ${drop} is ready. No account needed to open it.`],
    rows: [["Edition", edition], ["Code", unlockCode]],
    cta: { href: unlockUrl, label: "Open it" },
    after: ["New drops add to the same space, so keep this email."],
    note: ORDER_NOTE,
  });
}

/* A reservation could not be filled (sold out) or its window lapsed. */
export function reservationReleasedEmail({ name, drop, reason = `${drop} sold out before your reservation could be filled, so we released it.` }) {
  return notice({
    subject: `${drop}: your reservation was released`,
    label: "GONE",
    heading: "Gone. The next byte is loading.",
    paras: [`${firstName(name)}, ${reason}`, "Nothing was charged."],
    after: ["You stay on the list, and you hear about the next drop before it opens."],
    note: ORDER_NOTE,
  });
}

/* Card declined. The spot is held for a fixed window, then released. */
export function paymentFailedEmail({ name, drop, orderId, updateUrl, holdUntil }) {
  return notice({
    subject: `Action needed: payment for order ${orderId}`,
    label: "PAYMENT",
    heading: "Your payment did not go through.",
    paras: [`${firstName(name)}, the card on order ${orderId} was declined. Your spot in ${drop} is held until ${holdUntil}.`],
    cta: { href: updateUrl, label: "Update payment" },
    after: ["After that, the spot goes back to the waitlist. Questions about a charge? Reply and it reaches billing."],
    note: ORDER_NOTE,
    replyTo: GROUPS.billing,
  });
}

/* Money went back. Amount read from the payment provider, never the request. */
export function refundEmail({ name, orderId, amount, refundedAt = new Date() }) {
  const date = refundedAt instanceof Date ? refundedAt.toISOString().slice(0, 10) : String(refundedAt);
  return notice({
    subject: `Refund for order ${orderId}`,
    label: "REFUND",
    heading: "Refund issued.",
    paras: [
      `${firstName(name)}, we refunded ${amountText(amount)} to your original payment method.`,
      "Banks usually take 5 to 10 business days to show it.",
    ],
    rows: [["Order", orderId], ["Amount", amountText(amount)], ["Date", date]],
    after: ["Questions about a refund? Reply and it reaches billing."],
    note: ORDER_NOTE,
    replyTo: GROUPS.billing,
  });
}

/* Internal ops notice to alerts@. Same shell as customer mail so it reads
   the same in the inbox, but it leads with what broke and what to do next. */
const ALERT_ACTION =
  "If a subscriber is listed, add them to Beehiiv by hand. Then check the Beehiiv env vars on Vercel and run npm run check:waitlist.";

export function alertEmail({ event, detail = {} }) {
  const at = new Date().toISOString();
  const rows = Object.entries({ ...detail, at }).filter(([, v]) => v != null && v !== "");
  const show = (v) => (typeof v === "string" ? v : JSON.stringify(v));

  const table = kvTable(rows.map(([k, v]) => [k, show(v)]));

  const html = shell({
    label: "ALERT",
    heading: escapeHtml(event),
    body: [para(ALERT_ACTION), table].join("\n    "),
    note: "Sent to the alerts group by the site. Internal only, never customer-facing.",
  });

  const text = [`[alert] ${event}`, "", ALERT_ACTION, "", ...rows.map(([k, v]) => `${k}: ${show(v)}`)].join("\n");
  return { subject: `[alert] ${event}`, html, text };
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
