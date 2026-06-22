"use client";
import { useRecentlyViewed } from "./recent";
import { PRODUCTS } from "./products";
import ProductArt from "./ProductArt";
import { floorPrice } from "./config";

export default function RecentlyViewed({ exclude }) {
  const slugs = useRecentlyViewed(exclude);
  const items = slugs.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="related">
      <div className="label"><span className="kicker dim">YOU WERE LOOKING AT</span></div>
      <div className="shop-grid">
        {items.map((p) => (
          <a className="pcard" key={p.slug} href={`/shop/${p.slug}`}>
            <div className="thumb"><ProductArt variant={p.art} /></div>
            <div className="pbody">
              <span className="dept">{p.deptTag}</span>
              <h3>{p.name}</h3>
              <p>{p.tagline}</p>
              <div className="prow"><span className="pp">Physical + Digital</span><span className="price-sm">from ${floorPrice(p)}</span></div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
