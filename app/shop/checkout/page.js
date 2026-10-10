"use client";
import { useState } from "react";
import { useCart } from "@/features/shop/state/cart";
import ProductArt from "@/features/shop/components/ProductArt";
import { readAttribution, track } from "@/lib/attribution";

export default function Checkout() {
  const { items, subtotal, setQty, remove, clear, count, FREE_SHIP } = useCart();
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", website: "" });

  const valid = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const needsShipping = items.some((item) => item.format !== "digital");
  const shipping = !needsShipping || subtotal === 0 || subtotal >= FREE_SHIP ? 0 : 6;
  const total = subtotal + shipping;

  const place = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);

    // Payment is a demo, but the lead is not. Someone who fills in a name and an
    // address on a page that openly says "no payment taken" is the most qualified
    // email this site will produce, so record the reservation before the cart is
    // cleared. A capture failure must never block the confirmation.
    let sent = false;
    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          website: form.website,
          attribution: readAttribution(),
          items: items.map((it) => ({
            slug: it.slug,
            name: it.name,
            tierLabel: it.tierLabel,
            variant: it.variant,
            qty: it.qty,
            price: it.price,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      sent = Boolean(data.emailed);
    } catch {
      /* ignore - the buyer still gets their confirmation screen */
    }

    track("preorder_intent", { items: String(count), value: String(total) });

    setEmailed(sent);
    setSaving(false);
    setDone(true);
    clear();
  };

  if (done) {
    return (
      <main className="shop">
        <div className="wrap checkout-done">
          <span className="kicker">// ORDER CONFIRMED</span>
          <h1 style={{ marginTop: 14 }}>You&apos;re reserved.</h1>
          <p className="lead" style={{ marginTop: 14 }}>
            Thanks, {form.name.split(" ")[0] || "friend"}. {emailed ? `A confirmation is on its way to ${form.email}.` : `We'll email ${form.email} with the delivery details for each item.`}
          </p>
          <a className="btn btn-primary" href="/shop" style={{ marginTop: 26 }}>Back to the shop →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="shop">
      <div className="wrap">
        <div className="breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <span>Checkout</span></div>

        {items.length === 0 ? (
          <div className="shop-empty">
            <h3>Your cart is empty.</h3>
            <p>Nothing to check out yet.</p>
            <a className="btn btn-ghost" href="/shop">Browse the shop →</a>
          </div>
        ) : (
          <div className="checkout">
            <form className="co-form" onSubmit={place}>
              <span className="kicker">// PRE-ORDER DETAILS</span>
              <h1 style={{ margin: "14px 0 0" }}>Reserve your drop.</h1>
              <p className="lead" style={{ marginTop: 12 }}>Pre-order now, pay nothing today. We&apos;ll confirm before each drop ships.</p>

              <label className="co-label">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label className="co-label">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
              {needsShipping && <label className="co-label">Shipping address <span className="opt-cur u-text-normal">(optional)</span><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>}
              <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />

              <button className="btn btn-primary" type="submit" disabled={!valid || saving} style={{ height: 54, justifyContent: "center", marginTop: 8 }}>
                {saving ? "Reserving…" : `Place pre-order · $${total}`}
              </button>
              <p className="fine">No payment taken now. This is a demo checkout.</p>
            </form>

            <aside className="co-summary">
              <div className="co-sum-head"><span className="kicker">// ORDER · {count}</span></div>
              <div className="co-lines">
                {items.map((it) => (
                  <div className="cart-item" key={it.id}>
                    <div className="ci-art"><ProductArt variant={it.art} companion={it.format === "digital"} /></div>
                    <div className="ci-info">
                      <div className="ci-top"><a href={`/shop/${it.slug}`}><h4>{it.name}</h4></a><button className="ci-x" onClick={() => remove(it.id)}>Remove</button></div>
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
              <div className="co-totals">
                <div className="co-row"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="co-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
                <div className="co-row total"><span>Total</span><span>${total}</span></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
