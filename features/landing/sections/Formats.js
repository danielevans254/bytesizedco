import SectionLabel from "@/components/ui/SectionLabel";
import ProductFormatBadge from "@/components/ui/ProductFormatBadge";
import ProductArt from "@/features/shop/components/ProductArt";

// "The formats": digital, physical and the paired signature.
export default function Formats() {
  return (
    <section id="signature">
      <div className="wrap reveal">
        <SectionLabel index="03" accent>THE FORMATS</SectionLabel>
        <h2>The idea chooses the format.</h2>
        <p className="lead u-mt-4">Some ideas belong on a screen. Some belong in your hands. Some become better when both parts work together.</p>
        <div className="sig">
          <div className="sig-card">
            <div className="sig-art digi"><ProductArt variant="read" companion /></div>
            <ProductFormatBadge format="digital" />
            <h3>Complete on a screen</h3>
            <p>Guides, templates, newsletters, artwork, tools, and other things made to download or access.</p>
          </div>
          <div className="sig-card">
            <div className="sig-art phys"><ProductArt variant="wear" /></div>
            <ProductFormatBadge format="physical" />
            <h3>Complete in your hands</h3>
            <p>Apparel, games, printed goods, tools, and objects that need no digital layer to earn their place.</p>
          </div>
          <div className="sig-card">
            <div className="sig-art pair"><ProductArt variant="play" /></div>
            <ProductFormatBadge format="hybrid" />
            <h3>Better as a pair</h3>
            <p>A physical object and digital companion, combined only when each part makes the other more valuable.</p>
          </div>
        </div>
        <p className="sig-eq">Digital <b>·</b> Physical <b>·</b> Physical + Digital</p>
      </div>
    </section>
  );
}
