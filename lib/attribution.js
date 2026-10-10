/* Traffic attribution, shared by the landing waitlist form and the checkout form.

   UTM params only exist in the URL of the first page a visitor lands on, and are
   gone as soon as they navigate or scroll to a form. Capture them once on load and
   keep them for the session, so a signup three clicks later still carries the
   channel that actually produced it.

   First touch wins: an internal navigation must never overwrite the real source.
   Every function is best-effort and swallows storage errors, because private mode
   and blocked storage must not break a signup. */

const ATTR_KEY = "bsc-attr";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const q = new URLSearchParams(window.location.search);
    const found = {};
    UTM_FIELDS.forEach((k) => {
      const v = q.get(k);
      if (v) found[k] = v.trim().slice(0, 120);
    });
    const ref = document.referrer || "";
    if (ref && !ref.startsWith(window.location.origin)) found.referrer = ref.slice(0, 200);
    found.landing_page = window.location.pathname.slice(0, 120);
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
  } catch {
    /* storage blocked - attribution is best-effort, never fatal */
  }
}

export function readAttribution() {
  try {
    const raw = sessionStorage.getItem(ATTR_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/* Fire a Plausible custom event. Safe to call unconditionally: plausible() only
   exists once NEXT_PUBLIC_PLAUSIBLE_SRC is configured, so this is a no-op in dev. */
export function track(event, props) {
  try {
    if (typeof window.plausible === "function") window.plausible(event, props ? { props } : undefined);
  } catch {
    /* analytics must never break a conversion */
  }
}
