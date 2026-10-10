"use client";
import { useState, useEffect } from "react";
import { useCart } from "../state/cart";
import { PRODUCTS } from "../data/products";
import ProductArt from "./ProductArt";
import { buildDefaultCartItem } from "../config";

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

  const shippableSubtotal = items
    .filter((item) => item.format !== "digital")
    .reduce((sum, item) => sum + item.price * item.qty, 0);
  const remaining = Math.max(0, FREE_SHIP - shippableSubtotal);
  const pct = Math.min(100, FREE_SHIP ? (shippableSubtotal / FREE_SHIP) * 100 : 0);

  const removeItem = (it) => { remove(it.id); setLastRemoved(it); };
  const undo = () => { if (lastRemoved) { add(lastRemoved); setLastRemoved(null); } };

  // one-click add of a product's shared default variant (for upsell)
  const addStandard = (p) => {
    const item = buildDefaultCartItem(p);
    if (!item) { location.href = `/shop/${p.slug}`; return; }
    add(item);
  };

  const inCart = new Set(items.map((i) => i.slug));
  const upsell = subtotal > 0 && remaining > 0
    ? PRODUCTS.filter((p) => !inCart.has(p.slug) && buildDefaultCartItem(p))
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
            {shippableSubtotal > 0 && <div className="ship-bar">
              <div className="ship-text">{remaining > 0 ? `Add $${remaining} for free shipping` : "✓ Free shipping unlocked"}</div>
              <div className="ship-track"><div className="ship-fill" style={{ width: pct + "%" }} /></div>
            </div>}

            <div className="cart-items">
              {items.map((it) => (
                <div className="cart-item" key={it.id}>
                  <div className="ci-art"><ProductArt variant={it.art} companion={it.format === "digital"} /></div>
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
              <a className="btn btn-primary btn-block cart-checkout" href="/shop/checkout" onClick={() => setOpen(false)}>
                Checkout · ${subtotal}
              </a>
              <p className="fine cart-fine">Pre-order. Delivery is confirmed before each drop closes.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
