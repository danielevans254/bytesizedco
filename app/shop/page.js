import { PRODUCTS } from "./products";
import ProductArt from "./ProductArt";
import QuickAdd from "./QuickAdd";

export const metadata = {
  title: "Shop · Byte Sized Co.",
  description: "Sample drops across every department — each a physical object paired with a digital companion.",
};

export default function ShopIndex() {
  return (
    <main className="shop">
      <div className="wrap">
        <div className="breadcrumb"><a href="/">Home</a> / <span>Shop</span></div>
        <span className="kicker">// THE SHOP</span>
        <h1 style={{ margin: "16px 0 0" }}>One per world.</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          A sample drop from each department. Every one is a numbered physical object, paired with a digital companion you keep.
        </p>

        <div className="shop-grid">
          {PRODUCTS.map((p) => (
            <a className="pcard" key={p.slug} href={`/shop/${p.slug}`}>
              <div className="thumb">
                <ProductArt variant={p.art} />
                <QuickAdd product={p} />
              </div>
              <div className="pbody">
                <span className="dept">{p.deptTag}</span>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
                <div className="prow">
                  <span className="pp">Physical + Digital</span>
                  <span className="price-sm">from ${p.price}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
