"use client";
import { useMemo, useState } from "react";
import { useCart } from "./cart";

function initSel(options) {
  const s = {};
  for (const o of options) {
    if (o.type === "text") s[o.id] = "";
    else if (o.type === "toggle") s[o.id] = false;
    else s[o.id] = o.required ? "" : o.values[0]?.id ?? "";
  }
  return s;
}

export default function ProductConfigurator({ product }) {
  const { add } = useCart();
  const options = product.options || [];
  const [sel, setSel] = useState(() => initSel(options));
  const [tierKey, setTierKey] = useState("standard");
  const [qty, setQty] = useState(1);

  const tier = product.tiers.find((t) => t.key === tierKey);
  const set = (id, v) => setSel((p) => ({ ...p, [id]: v }));

  // price + variant summary
  const { unit, summary, valid } = useMemo(() => {
    let delta = 0;
    const parts = [];
    let ok = true;
    for (const o of options) {
      if (o.type === "text") {
        if (sel[o.id]?.trim()) { delta += o.priceDelta || 0; parts.push(`“${sel[o.id].trim()}”`); }
      } else if (o.type === "toggle") {
        if (sel[o.id]) { delta += o.priceDelta || 0; parts.push(o.label); }
      } else {
        const v = o.values.find((x) => x.id === sel[o.id]);
        if (!v) { if (o.required) ok = false; continue; }
        delta += v.priceDelta || 0;
        parts.push(v.label);
      }
    }
    return { unit: tier.price + delta, summary: parts.join(" · "), valid: ok };
  }, [options, sel, tier]);

  const addIt = () => {
    if (!valid) return;
    const vid = options.map((o) => `${o.id}=${sel[o.id]}`).join("&");
    add({
      id: `${product.slug}:${tier.key}:${vid}`,
      slug: product.slug,
      name: product.name,
      art: product.art,
      tierLabel: tier.label,
      rc: tier.rc,
      gem: tier.gem,
      variant: summary,
      price: unit,
      qty,
    });
  };

  const deltaTag = (d) => (d ? (d > 0 ? `+$${d}` : `−$${Math.abs(d)}`) : "Included");

  return (
    <div className="atc">
      {/* type-specific options */}
      {options.map((o) => (
        <div className="opt" key={o.id}>
          <div className="opt-head">
            <span className="opt-label">{o.label}</span>
            {o.type === "swatch" && <span className="opt-cur">{o.values.find((v) => v.id === sel[o.id])?.label}</span>}
            {o.required && !sel[o.id] && <span className="opt-req">Select a {o.label.toLowerCase()}</span>}
          </div>

          {o.type === "size" && (
            <div className="opt-size">
              {o.values.map((v) => (
                <button key={v.id} className={"sz" + (sel[o.id] === v.id ? " on" : "") + (v.soldOut ? " out" : "")}
                  disabled={v.soldOut} onClick={() => set(o.id, v.id)} aria-pressed={sel[o.id] === v.id}>
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {o.type === "swatch" && (
            <div className="swatches">
              {o.values.map((v) => (
                <button key={v.id} className={"sw" + (sel[o.id] === v.id ? " on" : "")} style={{ "--sw": v.hex }}
                  onClick={() => set(o.id, v.id)} aria-label={v.label} title={v.label} aria-pressed={sel[o.id] === v.id} />
              ))}
            </div>
          )}

          {(o.type === "format" || o.type === "level") && (
            <div className="segmented">
              {o.values.map((v) => (
                <button key={v.id} className={"seg" + (sel[o.id] === v.id ? " on" : "")} onClick={() => set(o.id, v.id)} aria-pressed={sel[o.id] === v.id}>
                  {v.label}{v.priceDelta ? <span className="seg-d"> {deltaTag(v.priceDelta)}</span> : null}
                </button>
              ))}
            </div>
          )}

          {o.type === "bundle" && (
            <div className="bundle">
              {o.values.map((v) => (
                <button key={v.id} className={"bn" + (sel[o.id] === v.id ? " on" : "")} onClick={() => set(o.id, v.id)} aria-pressed={sel[o.id] === v.id}>
                  <span className="bn-radio" />
                  <span className="bn-text"><b>{v.label}</b><span>{v.sub}</span></span>
                  <span className="bn-price">{deltaTag(v.priceDelta || 0)}</span>
                </button>
              ))}
            </div>
          )}

          {o.type === "text" && (
            <div className="engrave">
              <input type="text" maxLength={o.max} placeholder={o.placeholder}
                value={sel[o.id]} onChange={(e) => set(o.id, e.target.value)} />
              <span className="engrave-meta">{sel[o.id].length}/{o.max} · +${o.priceDelta} when engraved</span>
            </div>
          )}

          {o.type === "toggle" && (
            <button className={"toggle-opt" + (sel[o.id] ? " on" : "")} onClick={() => set(o.id, !sel[o.id])} aria-pressed={sel[o.id]}>
              <span className="tg-box">{sel[o.id] ? "✓" : ""}</span>
              {o.label} <span className="tg-d">+${o.priceDelta}</span>
            </button>
          )}
        </div>
      ))}

      {/* rarity editions */}
      <div className="opt">
        <div className="opt-head"><span className="opt-label">Edition</span></div>
        <div className="tier-select">
          {product.tiers.map((t) => (
            <button key={t.key} className={"tier " + t.cls + (t.key === tierKey ? " on" : "")} onClick={() => setTierKey(t.key)} aria-pressed={t.key === tierKey}>
              <span className="t-top"><span className="gem">{t.gem}</span> {t.label}</span>
              <span className="t-bot"><span className="t-price">${t.price}</span><span className="t-of"> / {t.of}</span></span>
            </button>
          ))}
        </div>
      </div>

      {/* qty + add */}
      <div className="atc-row">
        <div className="qty big">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
        </div>
        <button className="btn btn-primary atc-btn" onClick={addIt} disabled={!valid}>
          {valid ? (
            <>Add to cart · <span key={unit * qty} className="pp-num">${unit * qty}</span></>
          ) : (
            "Select a size"
          )}
        </button>
      </div>

      <ul className="trust">
        <li>Numbered, limited edition</li>
        <li>Physical object + digital companion</li>
        <li>Pre-order — cancel anytime before the drop closes</li>
      </ul>
    </div>
  );
}
