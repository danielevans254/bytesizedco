import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "../products";
import ProductArt from "../ProductArt";
import ProductConfigurator from "../ProductConfigurator";
import ProductModules from "../ProductModules";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = getProduct(params.slug);
  if (!p) return { title: "Not found · Byte Sized Co." };
  return { title: `${p.name} · Byte Sized Co.`, description: p.tagline };
}

export default function ProductPage({ params }) {
  const p = getProduct(params.slug);
  if (!p) notFound();

  return (
    <main className="shop">
      <div className="wrap">
        <div className="breadcrumb">
          <a href="/">Home</a> / <a href="/shop">Shop</a> / <span>{p.dept}</span>
        </div>

        <div className="product">
          {/* media */}
          <div className="p-media">
            <div className="p-art"><ProductArt variant={p.art} /></div>
            <div className="companion">
              <div className="companion-head">
                <span className="kicker" style={{ color: "var(--accent-2)" }}>// THE COMPANION</span>
                <span className="pp">Digital</span>
              </div>
              <div className="p-art small"><ProductArt variant={p.art} companion /></div>
            </div>
          </div>

          {/* info */}
          <div className="p-info">
            <span className="dept">{p.deptTag}</span>
            <h1>{p.name}</h1>
            <p className="lead" style={{ marginTop: 14 }}>{p.tagline}</p>
            <div className="price-row">
              <span className="price">from ${p.price}</span>
              <span className="badge" style={{ marginLeft: 14 }}>{p.drop} · Numbered</span>
            </div>

            <ProductConfigurator product={p} />

            <div className="pairing">
              <div className="pair">
                <span className="pair-tag">Physical</span>
                <h4>{p.physical.title}</h4>
                <p>{p.physical.desc}</p>
              </div>
              <div className="pair-plus">+</div>
              <div className="pair">
                <span className="pair-tag digi">Digital</span>
                <h4>{p.digital.title}</h4>
                <p>{p.digital.desc}</p>
              </div>
            </div>

            <ProductModules modules={p.modules} />
          </div>
        </div>
      </div>
    </main>
  );
}
