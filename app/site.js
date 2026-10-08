// Canonical origin, used by metadata, the sitemap, robots, and JSON-LD.
// Override with NEXT_PUBLIC_SITE_URL on preview deployments so they don't emit
// production URLs into structured data.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bytesizedco.com").replace(/\/$/, "");
