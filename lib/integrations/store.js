/* Own-the-list persistence.

   Beehiiv is the sending platform, not the system of record. Without this, the
   only durable copy of a subscriber lives on Beehiiv's servers, and the list is
   hostage to one provider. This writes a second copy you own.

   Uses Supabase's PostgREST endpoint directly rather than @supabase/supabase-js,
   to keep the app at three dependencies and match the hand-rolled Beehiiv call.

   Every function is best-effort and never throws. A storage outage must cost you
   a row, never a signup. */

import { sourceLabel } from "./beehiiv";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storeOn = Boolean(URL && KEY);

/* Insert one row. Pass onConflict (a column name with a unique constraint) to
   upsert instead of erroring on a repeat signup. */
export async function insert(table, row, { onConflict } = {}) {
  if (!storeOn) return { ok: false, skipped: true };

  const qs = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
  const prefer = onConflict
    ? "resolution=merge-duplicates,return=minimal"
    : "return=minimal";

  try {
    const res = await fetch(`${URL.replace(/\/$/, "")}/rest/v1/${table}${qs}`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: prefer,
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `supabase ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/* Record a signup in our own table.

   Called BEFORE the Beehiiv call, deliberately. The whole point of keeping our own
   copy is that a Beehiiv outage must not cost us the lead. A rare orphan row from a
   subscribe that Beehiiv later rejects is the cheaper failure. */
export async function recordSignup({ email, source, interests, attribution = {}, ip }) {
  if (!storeOn) return;
  const res = await insert(
    "waitlist_signups",
    {
      email,
      source: sourceLabel(source),
      interests: interests || null,
      utm_source: attribution.utm_source || null,
      attribution,
      ip,
    },
    { onConflict: "email" }
  );
  if (!res.ok && !res.skipped) console.error("[store] signup write failed:", res.error);
}

/* Record a pre-order intent. Separate table: a reservation is a different object
   from a list signup, carries line items, and repeats are legitimate rather than
   duplicates, so there is no upsert here. */
export async function recordPreorder(row) {
  if (!storeOn) return;
  const res = await insert("preorders", row);
  if (!res.ok && !res.skipped) console.error("[store] preorder write failed:", res.error);
}
