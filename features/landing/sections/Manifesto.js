import SectionLabel from "@/components/ui/SectionLabel";

export default function Manifesto() {
  return (
    <section id="manifesto">
      <div className="wrap">
        <div className="manifesto-grid">
          <div className="reveal">
            <SectionLabel index="01">WHAT WE BELIEVE</SectionLabel>
            <h2>Range is the point.<br />Taste gives it a spine.</h2>
            <p className="lead u-mt-5 u-text-muted">One company for many interests, tied together by a clear standard. Byte Sized is the principle, not the category.</p>
          </div>
          <div className="reveal d1">
            <div className="rows">
              <div className="m-row"><span className="n">01</span><span>Everything you&apos;re into deserves better than scattered tabs and noise.</span></div>
              <div className="m-row"><span className="n">02</span><span>Considered beats disposable. <em>Always.</em></span></div>
              <div className="m-row"><span className="n">03</span><span>The format follows the idea: <em>digital, physical, or both.</em></span></div>
              <div className="m-row"><span className="n">04</span><span>Small things, done right. Easy to try, <em>worth keeping.</em></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
