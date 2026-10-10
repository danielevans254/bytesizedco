/* Resend transport. Hand-rolled fetch rather than the SDK, to keep the app at
   three dependencies. Best-effort: never throws, so a mail failure can never cost
   a signup. Templates do not live here; Resend only sends what the code renders. */

import { RESEND_API_KEY, EMAIL_FROM, DEFAULT_REPLY_TO, emailOn } from "./config";

export async function sendEmail({ to, subject, html, text, replyTo = DEFAULT_REPLY_TO }) {
  if (!emailOn) return { ok: false, skipped: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
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
