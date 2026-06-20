"use client";
import { useState, useEffect } from "react";
import { useCart } from "./cart";
import ProductArt from "./ProductArt";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, count, clear, FREE_SHIP } = useCart();
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [setOpen]);

  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, FREE_SHIP ? (subtotal / FREE_SHIP) * 100 : 0);

  const checkout = () => {
    setPlaced(true);
    clear();
    setTimeout(() => {
      setPlaced(false);
      setOpen(false);
    }, 2800);
  };

  return (
    <>
      <div className={"cart-overlay" + (open ? " show" : "")} onClick={() => setOpen(false)} />
      <aside className={"cart-drawer" + (open ? " show" : "")} aria-hidden={!open} aria-label="Cart">
        <div className="cart-head">
          <span className="kicker">// YOUR CART{count > 0 ? ` · ${count}` : ""}</span>
          <button className="cart-x" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {placed ? (
          <div className="cart-empty">
            <h3>Reserved.</h3>
            <p>You&apos;re locked in for these drops. We&apos;ll email you the moment each one ships.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <h3>Your cart is empty.</h3>
            <p>Pick something from a drop.</p>
            <a className="btn btn-ghost" href="/shop" onClick={() => setOpen(false)}>Browse the shop →</a>
          </div>
        ) : (
          <>
            <div className="ship-bar">
              <div className="ship-text">
                {remaining > 0 ? `Add $${remaining} for free shipping` : "✓ Free shipping unlocked"}
              </div>
              <div className="ship-track"><div className="ship-fill" style={{ width: pct + "%" }} /></div>
            </div>

            <div className="cart-items">
              {items.map((it) => (
                <div className="cart-item" key={it.id}>
                  <div className="ci-art"><ProductArt variant={it.art} /></div>
                  <div className="ci-info">
                    <div className="ci-top">
                      <a href={`/shop/${it.slug}`} onClick={() => setOpen(false)}><h4>{it.name}</h4></a>
                      <button className="ci-x" onClick={() => remove(it.id)}>Remove</button>
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
            </div>

            <div className="cart-foot">
              <div className="cart-sub"><span>Subtotal</span><span>${subtotal}</span></div>
              <button className="btn btn-primary" style={{ width: "100%", height: 54, justifyContent: "center", fontSize: 15 }} onClick={checkout}>
                Reserve · ${subtotal}
              </button>
              <p className="fine" style={{ textAlign: "center" }}>Pre-order. Ships when each drop closes.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
