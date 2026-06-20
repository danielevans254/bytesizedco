import { CartProvider } from "./cart";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";

function Mark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <path d="M9 8 H7 V24 H9" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <path d="M23 8 H25 V24 H23" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <rect x="13" y="13" width="6" height="6" rx="1" fill="var(--accent-ink)" />
    </svg>
  );
}

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <nav className="shop-nav">
        <div className="wrap nav-inner">
          <a className="brand" href="/"><Mark /> Byte&nbsp;Sized&nbsp;Co.</a>
          <div className="nav-links">
            <a className="link" href="/shop">Shop</a>
            <a className="link" href="/#how">How it works</a>
            <CartButton />
            <a className="btn btn-primary" href="/#join" style={{ height: 40, padding: "0 18px" }}>Join</a>
          </div>
        </div>
      </nav>

      {children}

      <CartDrawer />

      <footer>
        <div className="wrap">
          <div className="foot-inner">
            <a className="brand" href="/"><Mark /> Byte&nbsp;Sized&nbsp;Co.</a>
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
