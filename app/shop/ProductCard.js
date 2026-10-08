import ProductArt from "./ProductArt";
import QuickAdd from "./QuickAdd";
import ProductFormatBadge from "../ui/ProductFormatBadge";
import { floorPrice } from "./config";

export default function ProductCard({ product, quickAdd = false }) {
  return (
    <a className="pcard" href={`/shop/${product.slug}`}>
      <div className="thumb">
        <ProductArt variant={product.art} companion={product.format === "digital"} />
        {quickAdd && <QuickAdd product={product} />}
      </div>
      <div className="pbody">
        <span className="dept">{product.deptTag}</span>
        <h3>{product.name}</h3>
        <p>{product.tagline}</p>
        <div className="prow">
          <ProductFormatBadge product={product} />
          <span className="price-sm">from ${floorPrice(product)}</span>
        </div>
      </div>
    </a>
  );
}
