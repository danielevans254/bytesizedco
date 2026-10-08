import { PRODUCTS } from "./products";
import ProductCard from "./ProductCard";
import SectionLabel from "../ui/SectionLabel";

export default function RelatedProducts({ slug, dept }) {
  const same = PRODUCTS.filter((p) => p.slug !== slug && p.dept === dept);
  const others = PRODUCTS.filter((p) => p.slug !== slug && p.dept !== dept);
  const list = [...same, ...others].slice(0, 4);
  if (!list.length) return null;

  return (
    <section className="related">
      <SectionLabel>YOU MIGHT ALSO LIKE</SectionLabel>
      <div className="shop-grid">
        {list.map((p) => <ProductCard key={p.slug} product={p} quickAdd />)}
      </div>
    </section>
  );
}
