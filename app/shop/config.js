// Shared shop config + deterministic helpers (no Date/Math.random → SSR-safe).

export const FREE_SHIP = 75;
export const DEFAULT_TIER = "standard";

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Stable "units left" per tier. Founder skews scarce, standard plentiful.
export function availability(slug, tierKey, of) {
  const h = hash(slug + ":" + tierKey);
  const pct =
    tierKey === "founder" ? 0.1 + (h % 25) / 100 :
    tierKey === "rare" ? 0.2 + (h % 45) / 100 :
    0.3 + (h % 60) / 100;
  return Math.max(2, Math.min(of, Math.round(of * pct)));
}

// True floor price for "from $X": standard tier + the cheapest of each option axis.
export function floorPrice(product) {
  const std = product.tiers.find((t) => t.key === "standard").price;
  let minDelta = 0;
  for (const o of product.options || []) {
    if (o.type === "text" || o.type === "toggle") continue;
    minDelta += Math.min(0, ...o.values.map((v) => v.priceDelta || 0));
  }
  return std + minDelta;
}
