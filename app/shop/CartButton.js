"use client";
import { useCart } from "./cart";

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
      Cart
      <span className={"cart-count" + (count > 0 ? " on" : "")}>{count}</span>
    </button>
  );
}
