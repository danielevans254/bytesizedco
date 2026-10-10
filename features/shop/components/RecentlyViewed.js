"use client";
import { useRecentlyViewed } from "../state/recent";
import { PRODUCTS } from "../data/products";
import ProductCard from "./ProductCard";
import SectionLabel from "@/components/ui/SectionLabel";

export default function RecentlyViewed({ exclude }) {
  const slugs = useRecentlyViewed(exclude);
  const items = slugs.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="related">
      <SectionLabel>YOU WERE LOOKING AT</SectionLabel>
      <div className="shop-grid">
        {items.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  );
}
