"use client";
import { useCart } from "../state/cart";
import { buildDefaultCartItem } from "../config";

export default function QuickAdd({ product }) {
  const { add } = useCart();
  const item = buildDefaultCartItem(product);

  // products that need a required choice (e.g. size) link to the page instead
  if (!item) return null;

  const quick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    add(item);
  };

  return (
    <button className="quick-add" onClick={quick} aria-label={`Quick add ${product.name}`}>
      Add · ${item.price}
    </button>
  );
}
