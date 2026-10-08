/* Transactional email via Resend, sent from your own domain.

   Scope: email that Beehiiv does NOT already send. Beehiiv owns the newsletter and
   the waitlist welcome (send_welcome_email), so nothing here fires on a landing
   signup, or a visitor would get two emails for one action.

   Hand-rolled fetch against the REST endpoint rather than the SDK, to keep the app
   at three dependencies. Best-effort: a mail failure must never cost a signup. */

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM; // e.g. "Byte Sized Co. <hello@yourdomain.co>"
const REPLY_TO = process.env.EMAIL_REPLY_TO;
const POSTAL = process.env.COMPANY_POSTAL_ADDRESS;

export const emailOn = Boolean(KEY && FROM);

export async function sendEmail({ to, subject, html, text }) {
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
        ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
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

function footerHtml() {
  // CAN-SPAM: a transactional message is exempt from the unsubscribe requirement,
  // but a real postal address is still the safe default. Set
  // COMPANY_POSTAL_ADDRESS once the LLC has a registered address.
  const addr = POSTAL
    ? `<div style="color:${MUTED};font-size:11px;line-height:1.6;margin-top:14px">${POSTAL}</div>`
    : "";
  return `<div style="border-top:1px solid ${LINE};margin-top:28px;padding-top:18px">
    <div style="color:${MUTED};font-size:12px;line-height:1.6">
      You are receiving this because you reserved a spot on bytesized.co.
      This is a transactional message about that reservation, not marketing.
    </div>${addr}
  </div>`;
}

/* Reservation confirmation for the pre-order form.

   Deliberately does NOT say "order confirmed" or imply money changed hands: the
   checkout takes no payment today, and the email must not claim otherwise. */
export function preorderEmail({ name, items = [], total }) {
  const first = String(name || "").trim().split(" ")[0] || "friend";

  const rows = items
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

  const html = `<div style="background:${BG};padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:${SURFACE};border:1px solid ${LINE};border-radius:16px;padding:32px">
    <div style="color:${ACCENT};font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:600">// RESERVED</div>
    <h1 style="color:${TEXT};font-size:26px;line-height:1.25;margin:14px 0 0;font-weight:700">Your spot is held.</h1>
    <p style="color:${MUTED};font-size:15px;line-height:1.65;margin:14px 0 0">
      Thanks, ${escapeHtml(first)}. Nothing has been charged. This is a reservation for Drop 001,
      and we will email you before anything ships.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:24px">${rows}
      <tr>
        <td style="padding:14px 0 0;color:${TEXT};font-size:15px;font-weight:700">Reserved total</td>
        <td style="padding:14px 0 0;color:${ACCENT};font-size:15px;font-weight:700;text-align:right">${money(total)}</td>
      </tr>
    </table>

    <p style="color:${MUTED};font-size:14px;line-height:1.65;margin:24px 0 0">
      Each release clearly states whether it is digital, physical, or paired.
      Your reservation details are listed above.
    </p>
    ${footerHtml()}
  </div>
</div>`;

  const text = [
    "RESERVED",
    "",
    "Your spot is held.",
    "",
    `Thanks, ${first}. Nothing has been charged. This is a reservation for Drop 001, and we will email you before anything ships.`,
    "",
    ...items.map((it) => `- ${it.name} ${it.tierLabel || ""} x${it.qty || 1}  ${money(it.price)}`),
    "",
    `Reserved total: ${money(total)}`,
    "",
    "Each release clearly states whether it is digital, physical, or paired. Your reservation details are listed above.",
    "",
    POSTAL || "",
  ]
    .join("\n")
    .trim();

  return { subject: "Your Drop 001 reservation", html, text };
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
