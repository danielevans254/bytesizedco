// Canonical origin, used by metadata, the sitemap, robots, and JSON-LD.
// Override with NEXT_PUBLIC_SITE_URL on preview deployments so they don't emit
// production URLs into structured data.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bytesizedco.com").replace(/\/$/, "");

// Bare host for display in copy ("bytesizedco.com"). Never hard-code the domain:
// bytesized.co belongs to someone else.
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/* Company facts shared by the site footer and every email footer, so a change
   here (or in the env vars below) reaches both at once. Beehiiv cannot read this;
   mirror these values in Beehiiv > Settings > Emails by hand. */
export const COMPANY = {
  name: "Byte Sized Co.",
  tagline: "Your world, simplified.",
};

// Social profiles. A link renders only once its env var holds a full URL, so no
// surface ever ships a dead href="#". NEXT_PUBLIC_ so the client footer sees them.
export const SOCIAL_LINKS = [
  { label: "Instagram", short: "IG", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM },
  { label: "TikTok", short: "TikTok", href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK },
  { label: "X", short: "X", href: process.env.NEXT_PUBLIC_SOCIAL_X },
].filter((s) => Boolean(s.href));
