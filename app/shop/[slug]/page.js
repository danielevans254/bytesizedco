import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "../products";
import { SITE_URL } from "../../site";
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
  const url = `${SITE_URL}/shop/${p.slug}`;
  return {
    title: `${p.name} · Byte Sized Co.`,
    description: p.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: `${p.name} · Byte Sized Co.`,
      description: p.tagline,
      type: "website",
      url,
    },
  };
}

/* Structured data. Prices span the three rarity tiers, so this is an
   AggregateOffer rather than a single Offer. Availability is PreOrder because
   that is what the page actually offers: checkout takes no payment today.
   Revisit this the moment real payments go live. */
function productJsonLd(p) {
  const prices = p.tiers.map((t) => t.price);
  const url = `${SITE_URL}/shop/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline,
    sku: p.slug,
    category: p.dept,
    url,
    brand: { "@type": "Brand", name: "Byte Sized Co." },
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "USD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: p.tiers.length,
      availability: "https://schema.org/PreOrder",
    },
  };
}

export default function ProductPage({ params }) {
  const p = getProduct(params.slug);
  if (!p) notFound();

  return (
    <main className="shop">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }}
      />
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
