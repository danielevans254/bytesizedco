import SectionLabel from "@/components/ui/SectionLabel";

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="wrap reveal">
        <SectionLabel index="02">HOW IT WORKS</SectionLabel>
        <h2>Three steps, on repeat.</h2>
        <div className="steps">
          <div className="step"><span className="ghost">01</span><span className="sn">// SUBSCRIBE</span><h3>Join the feed</h3><p>A free weekly read. The good stuff, found for you. No noise, no selling. Just taste.</p></div>
          <div className="step"><span className="ghost">02</span><span className="sn">// SENSE</span><h3>We read the room</h3><p>What you click and love tells us what to make, so we only ever build what you actually want.</p></div>
          <div className="step"><span className="ghost">03</span><span className="sn">// DROP</span><h3>The drop lands</h3><p>A focused physical, digital, or paired release. You get first access. It sells out. Repeat.</p></div>
        </div>
      </div>
    </section>
  );
}
