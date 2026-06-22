import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "../products";
import ProductView from "../ProductView";
import ProductModules from "../ProductModules";
import RelatedProducts from "../RelatedProducts";
import RecentlyViewed from "../RecentlyViewed";

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
          <a href="/">Home</a> / <a href="/shop">Shop</a> /{" "}
          <a href={`/shop?dept=${encodeURIComponent(p.dept)}`}>{p.dept}</a> / <span>{p.name}</span>
        </div>

        <ProductView product={p} />
        <ProductModules modules={p.modules} />
        <RelatedProducts slug={p.slug} dept={p.dept} />
        <RecentlyViewed exclude={p.slug} />
      </div>
    </main>
  );
}
