import { PRODUCTS } from "./products";
import ShopBrowser from "./ShopBrowser";
import RecentlyViewed from "./RecentlyViewed";
import SectionLabel from "../ui/SectionLabel";

export const metadata = {
  title: "Shop · Byte Sized Co.",
  description: "Curated digital products, physical goods, and paired releases across every department.",
};

export default function ShopIndex() {
  return (
    <main className="shop">
      <div className="wrap">
        <div className="breadcrumb"><a href="/">Home</a> / <span>Shop</span></div>
        <div className="page-intro">
          <SectionLabel accent>THE SHOP</SectionLabel>
          <h1>One per world.</h1>
          <p className="lead">
            Curated digital products, physical goods, and signature pairings across every department.
          </p>
        </div>

        <ShopBrowser products={PRODUCTS} />
        <RecentlyViewed />
      </div>
    </main>
  );
}
