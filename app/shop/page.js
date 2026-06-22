import { PRODUCTS } from "./products";
import ShopBrowser from "./ShopBrowser";
import RecentlyViewed from "./RecentlyViewed";

export const metadata = {
  title: "Shop · Byte Sized Co.",
  description: "Sample drops across every department, each a physical object paired with a digital companion.",
};

export default function ShopIndex() {
  return (
    <main className="shop">
      <div className="wrap">
        <div className="breadcrumb"><a href="/">Home</a> / <span>Shop</span></div>
        <span className="kicker">// THE SHOP</span>
        <h1 style={{ margin: "16px 0 0" }}>One per world.</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          A sample drop from each department. Every one is a numbered physical object, paired with a digital companion you keep.
        </p>

        <ShopBrowser products={PRODUCTS} />
        <RecentlyViewed />
      </div>
    </main>
  );
}
