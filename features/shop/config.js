// Shared shop config + deterministic helpers (no Date/Math.random → SSR-safe).

export const FREE_SHIP = 75;
export const DEFAULT_TIER = "standard";

export const PRODUCT_FORMATS = Object.freeze({
  digital: "Digital",
  physical: "Physical",
  hybrid: "Physical + Digital",
});

export function productFormat(productOrFormat) {
  const value = typeof productOrFormat === "string"
    ? productOrFormat
    : productOrFormat?.format;
  return Object.hasOwn(PRODUCT_FORMATS, value) ? value : "hybrid";
}

export function productFormatLabel(productOrFormat) {
  return PRODUCT_FORMATS[productFormat(productOrFormat)];
}

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
  const std = product.tiers.find((t) => t.key === DEFAULT_TIER) || product.tiers[0];
  let minDelta = 0;
  for (const o of product.options || []) {
    if (o.type === "text" || o.type === "toggle") continue;
    minDelta += Math.min(0, ...o.values.map((v) => v.priceDelta || 0));
  }
  return std.price + minDelta;
}

// One source for the default variant used by quick-add and cart upsells.
// Returns null when the product needs a required choice on its detail page.
export function buildDefaultCartItem(product) {
  const options = product.options || [];
  if (options.some((option) => option.required)) return null;

  const tier = product.tiers.find((item) => item.key === DEFAULT_TIER) || product.tiers[0];
  if (!tier) return null;

  let delta = 0;
  const parts = [];
  const variantId = options.map((option) => {
    if (option.type === "text" || option.type === "toggle") {
      return `${option.id}=${option.type === "toggle" ? false : ""}`;
    }
    const value = option.values?.[0];
    if (value) {
      delta += value.priceDelta || 0;
      parts.push(value.label);
    }
    return `${option.id}=${value?.id ?? ""}`;
  }).join("&");

  return {
    id: `${product.slug}:${tier.key}:${variantId}`,
    slug: product.slug,
    name: product.name,
    art: product.art,
    format: productFormat(product),
    tierLabel: tier.label,
    rc: tier.rc,
    gem: tier.gem,
    variant: parts.join(" · "),
    price: tier.price + delta,
    qty: 1,
  };
}
