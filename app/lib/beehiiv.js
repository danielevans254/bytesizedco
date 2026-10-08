/* Beehiiv client. Hand-rolled fetch rather than an SDK, to keep the app at three
   dependencies. Shared by the waitlist form and the pre-order form so there is one
   code path to the sending platform, not two that drift. */

import { SITE_URL } from "../site";

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID; // e.g. "pub_xxxxxxxx"

export const beehiivOn = Boolean(API_KEY && PUB_ID);

// optional behaviour overrides
const WELCOME_EMAIL = process.env.BEEHIIV_WELCOME_EMAIL !== "false"; // default true
const DOUBLE_OPT = process.env.BEEHIIV_DOUBLE_OPT || "off"; // "on" | "off" | "not_set"
const COHORT = process.env.BEEHIIV_COHORT || "Founding Member";

/* Which form produced the signup. Mapped server-side from a short key so the
   client can never write an arbitrary value into a subscriber record. */
export const SOURCE_LABELS = {
  landing: "Landing Waitlist",
  checkout: "Pre-order Intent",
};

export function sourceLabel(key) {
  return SOURCE_LABELS[String(key || "landing")] || SOURCE_LABELS.landing;
}

/* The client sends the UTMs it captured on landing. Treat it as untrusted input:
   keep only the fields we asked for, clamp their length, and fall back to the old
   constants when a visitor arrives with no campaign tagging at all.

   These ride on Beehiiv's own utm_* params rather than custom fields, so no new
   custom field has to exist in the publication for a subscribe to succeed. */
// landing_page is kept for our own records; it is not a Beehiiv parameter.
const ATTR_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referrer", "landing_page"];
const DEFAULT_UTM = { source: "direct", medium: "waitlist", campaign: "founding" };

export function cleanAttribution(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const k of ATTR_FIELDS) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return out;
}

export async function beehiivSubscribe(email, { interests = "", attribution = {}, source = "landing" } = {}) {
  const custom_fields = [
    { name: "Source", value: sourceLabel(source) },
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
      // Falls back to our own origin for a direct visit. Derived from SITE_URL
      // rather than hardcoded: this used to read "bytesized.co", a domain we do
      // not own, so every direct signup was tagged with someone else's site.
      referring_site: attribution.referrer || SITE_URL,
      custom_fields,
    }),
  });
}

export async function beehiivActiveCount() {
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

/* Heuristic: does a failed Beehiiv subscribe mean "this email is already
   subscribed"? We keep reactivate_existing:false (don't resurrect people who
   unsubscribed), but a duplicate signup should read as success, not a red error. */
export function isAlreadySubscribed(status, msg) {
  if (status === 409) return true;
  const m = String(msg || "").toLowerCase();
  return m.includes("already") || m.includes("exists") || m.includes("duplicate");
}

/* Pull the human-readable error out of a failed Beehiiv response. */
export async function beehiivError(res) {
  try {
    const e = await res.json();
    return e?.errors?.[0]?.message || e?.message || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}
