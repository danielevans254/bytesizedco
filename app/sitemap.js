import { PRODUCTS } from "@/features/shop/data/products";
import { SITE_URL } from "@/lib/site";

// /shop/checkout is deliberately absent: it is a transactional dead end, not a
// page worth indexing.
export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "weekly", priority: 0.8 },
    ...PRODUCTS.map((p) => ({
      url: `${SITE_URL}/shop/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ];
}
