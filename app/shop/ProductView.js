"use client";
import { useEffect, useMemo, useState } from "react";
import ProductArt from "./ProductArt";
import ProductConfigurator, { initSel } from "./ProductConfigurator";
import { recordRecent } from "./recent";
import ProductFormatBadge from "../ui/ProductFormatBadge";
import { productFormat } from "./config";

export default function ProductView({ product }) {
  const [sel, setSel] = useState(() => initSel(product.options));
  const [tierKey, setTierKey] = useState("standard");
  const [qty, setQty] = useState(1);
  const format = productFormat(product);

  useEffect(() => { recordRecent(product.slug); }, [product.slug]);

  // the selected rarity tier → drives the tiered digital companion perk
  const tier = useMemo(() => product.tiers.find((t) => t.key === tierKey), [product.tiers, tierKey]);

  // selected colour hex from a swatch option, if any → drives the art
  const color = useMemo(() => {
    const sw = (product.options || []).find((o) => o.type === "swatch");
    return sw ? sw.values.find((v) => v.id === sel[sw.id])?.hex : undefined;
  }, [product.options, sel]);

  return (
    <div className="product">
      <div className="p-media">
        <div className="p-art art-fade" key={color || "base"}>
          <ProductArt variant={product.art} color={color} companion={format === "digital"} />
        </div>
        {format === "hybrid" && product.digital && <div className="companion">
          <div className="companion-head">
            <span className="kicker">// THE COMPANION</span>
            <ProductFormatBadge format="digital" />
          </div>
          <div className="p-art small"><ProductArt variant={product.art} companion /></div>
        </div>}
      </div>

      <div className="p-info">
        <span className="dept">{product.deptTag}</span>
        <h1>{product.name}</h1>
        <p className="lead" style={{ marginTop: 14 }}>{product.tagline}</p>
        <div className="price-row">
          <span className="price">from ${product.price}</span>
          <span className="badge" style={{ marginLeft: 14 }}>{product.drop} · Numbered</span>
          <ProductFormatBadge product={product} />
        </div>

        <div className="quickfacts">
          {product.specs.map(([k, v]) => (<span className="qf" key={k}><b>{k}</b> {v}</span>))}
        </div>

        <ProductConfigurator
          product={product}
          sel={sel} setSel={setSel}
          tierKey={tierKey} setTierKey={setTierKey}
          qty={qty} setQty={setQty}
        />

        <div className={`pairing${format === "hybrid" ? "" : " single"}`}>
          {product.physical && (
            <div className="pair"><span className="pair-tag">Physical</span><h4>{product.physical.title}</h4><p>{product.physical.desc}</p></div>
          )}
          {format === "hybrid" && product.physical && product.digital && <div className="pair-plus">+</div>}
          {product.digital && (
            <div className="pair">
              <span className="pair-tag digi">Digital</span><h4>{product.digital.title}</h4><p>{product.digital.desc}</p>
              {tier?.digiPerk && (
                <p className="digi-perk"><span className="gem">{tier.gem}</span> {tier.label} unlock: {tier.digiPerk}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
