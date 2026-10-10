import { CartProvider } from "@/features/shop/state/cart";
import CartButton from "@/features/shop/components/CartButton";
import CartDrawer from "@/features/shop/components/CartDrawer";
import Brand from "@/components/ui/Brand";

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <nav className="shop-nav">
        <div className="wrap nav-inner">
          <Brand />
          <div className="nav-links">
            <a className="link" href="/shop">Shop</a>
            <a className="link" href="/#how">How it works</a>
            <CartButton />
            <a className="btn btn-primary btn-sm" href="/#join">Join</a>
          </div>
        </div>
      </nav>

      {children}

      <CartDrawer />

      <footer>
        <div className="wrap">
          <div className="foot-inner">
            <Brand />
            <div className="foot-links">
              <a href="/shop">Shop</a><a href="/#manifesto">About</a><a href="/#join">Join</a>
            </div>
          </div>
          <div className="foot-status"><i className="dot" /> SAMPLE STOREFRONT · DROP 001 LOADING</div>
          <div className="copy">© 2026 Byte Sized Co. · Your world, simplified.</div>
        </div>
      </footer>
    </CartProvider>
  );
}
