"use client";
import { useCart } from "./cart";

export default function QuickAdd({ product }) {
  const { add } = useCart();
  const opts = product.options || [];
  const hasRequired = opts.some((o) => o.required);

  // products that need a required choice (e.g. size) link to the page instead
  if (hasRequired) return null;

  const t = product.tiers.find((x) => x.key === "standard");

  const quick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let delta = 0;
    const parts = [];
    const vid = opts
      .map((o) => {
        if (o.type === "text" || o.type === "toggle") return `${o.id}=${o.type === "toggle" ? false : ""}`;
        const v = o.values[0];
        if (v) { delta += v.priceDelta || 0; parts.push(v.label); }
        return `${o.id}=${v?.id ?? ""}`;
      })
      .join("&");
    add({
      id: `${product.slug}:standard:${vid}`,
      slug: product.slug,
      name: product.name,
      art: product.art,
      tierLabel: "Standard",
      rc: "standard",
      gem: "◆",
      variant: parts.join(" · "),
      price: t.price + delta,
      qty: 1,
    });
  };

  return (
    <button className="quick-add" onClick={quick} aria-label={`Quick add ${product.name}`}>
      Add · ${t.price}
    </button>
  );
}
