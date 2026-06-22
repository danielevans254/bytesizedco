import { PRODUCTS } from "./products";
import ProductArt from "./ProductArt";
import QuickAdd from "./QuickAdd";
import { floorPrice } from "./config";

export default function RelatedProducts({ slug, dept }) {
  const same = PRODUCTS.filter((p) => p.slug !== slug && p.dept === dept);
  const others = PRODUCTS.filter((p) => p.slug !== slug && p.dept !== dept);
  const list = [...same, ...others].slice(0, 4);
  if (!list.length) return null;

  return (
    <section className="related">
      <div className="label"><span className="kicker dim">YOU MIGHT ALSO LIKE</span></div>
      <div className="shop-grid">
        {list.map((p) => (
          <a className="pcard" key={p.slug} href={`/shop/${p.slug}`}>
            <div className="thumb"><ProductArt variant={p.art} /><QuickAdd product={p} /></div>
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
