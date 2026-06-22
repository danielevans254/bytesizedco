"use client";
import { useState, useEffect } from "react";
import { useCart } from "./cart";
import { PRODUCTS } from "./products";
import ProductArt from "./ProductArt";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, add, subtotal, count, FREE_SHIP } = useCart();
  const [lastRemoved, setLastRemoved] = useState(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [setOpen]);
  useEffect(() => {
    if (!lastRemoved) return;
    const t = setTimeout(() => setLastRemoved(null), 5000);
    return () => clearTimeout(t);
  }, [lastRemoved]);

  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, FREE_SHIP ? (subtotal / FREE_SHIP) * 100 : 0);

  const removeItem = (it) => { remove(it.id); setLastRemoved(it); };
  const undo = () => { if (lastRemoved) { add(lastRemoved); setLastRemoved(null); } };

  // one-click add of a product's standard default variant (for upsell)
  const addStandard = (p) => {
    if ((p.options || []).some((o) => o.required)) { location.href = `/shop/${p.slug}`; return; }
    const t = p.tiers.find((x) => x.key === "standard");
    let delta = 0; const parts = [];
    const vid = (p.options || []).map((o) => {
      if (o.type === "text" || o.type === "toggle") return `${o.id}=${o.type === "toggle" ? false : ""}`;
      const v = o.values[0]; if (v) { delta += v.priceDelta || 0; parts.push(v.label); }
      return `${o.id}=${v?.id ?? ""}`;
    }).join("&");
    add({ id: `${p.slug}:standard:${vid}`, slug: p.slug, name: p.name, art: p.art, tierLabel: "Standard", rc: "standard", gem: "◆", variant: parts.join(" · "), price: t.price + delta, qty: 1 });
  };

  const inCart = new Set(items.map((i) => i.slug));
  const upsell = subtotal > 0 && remaining > 0
    ? PRODUCTS.filter((p) => !inCart.has(p.slug) && !(p.options || []).some((o) => o.required))
        .sort((a, b) => a.base - b.base).slice(0, 2)
    : [];

  return (
    <>
      <div className={"cart-overlay" + (open ? " show" : "")} onClick={() => setOpen(false)} />
      <aside className={"cart-drawer" + (open ? " show" : "")} aria-hidden={!open} aria-label="Cart">
        <div className="drawer-handle" />
        <div className="cart-head">
          <span className="kicker">// YOUR CART{count > 0 ? ` · ${count}` : ""}</span>
          <button className="cart-x" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <h3>Your cart is empty.</h3>
            <p>Pick something from a drop.</p>
            <a className="btn btn-ghost" href="/shop" onClick={() => setOpen(false)}>Browse the shop →</a>
          </div>
        ) : (
          <>
            <div className="ship-bar">
              <div className="ship-text">{remaining > 0 ? `Add $${remaining} for free shipping` : "✓ Free shipping unlocked"}</div>
              <div className="ship-track"><div className="ship-fill" style={{ width: pct + "%" }} /></div>
            </div>

            <div className="cart-items">
              {items.map((it) => (
                <div className="cart-item" key={it.id}>
                  <div className="ci-art"><ProductArt variant={it.art} /></div>
                  <div className="ci-info">
                    <div className="ci-top">
                      <a href={`/shop/${it.slug}`} onClick={() => setOpen(false)}><h4>{it.name}</h4></a>
                      <button className="ci-x" onClick={() => removeItem(it)}>Remove</button>
                    </div>
                    <div className={"rar " + it.rc}><span className="gem">{it.gem}</span> {it.tierLabel}</div>
                    {it.variant && <div className="ci-variant">{it.variant}</div>}
                    <div className="ci-bottom">
                      <div className="qty">
                        <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease">−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <div className="ci-price">${it.price * it.qty}</div>
                    </div>
                  </div>
                </div>
              ))}

              {upsell.length > 0 && (
                <div className="upsell">
                  <div className="upsell-head">Complete your order</div>
                  {upsell.map((p) => (
                    <div className="up-item" key={p.slug}>
                      <div className="up-art"><ProductArt variant={p.art} /></div>
                      <div className="up-info"><a href={`/shop/${p.slug}`} onClick={() => setOpen(false)}>{p.name}</a><span>${p.base}</span></div>
                      <button className="up-add" onClick={() => addStandard(p)} aria-label={`Add ${p.name}`}>Add</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lastRemoved && (
              <div className="snackbar">
                <span>Removed {lastRemoved.name}</span>
                <button onClick={undo}>Undo</button>
              </div>
            )}

            <div className="cart-foot">
              <div className="cart-sub"><span>Subtotal</span><span>${subtotal}</span></div>
              <a className="btn btn-primary" style={{ width: "100%", height: 54, justifyContent: "center", fontSize: 15 }} href="/shop/checkout" onClick={() => setOpen(false)}>
                Checkout · ${subtotal}
              </a>
              <p className="fine" style={{ textAlign: "center" }}>Pre-order. Ships when each drop closes.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
