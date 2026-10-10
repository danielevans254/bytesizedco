// Hero with the typewriter line (#type) and the tilting Founder card (#tcard).
export default function Hero() {
  return (
    <header id="top">
      <section className="hero">
        <span className="tick tl" /><span className="tick tr" />
        <div className="wrap">
          <div className="hero-grid">
            <div className="reveal">
              <span className="kicker">// PRE-LAUNCH · WAITLIST OPEN</span>
              <h1>Your world,<br /><span className="stroke">simplified.</span></h1>
              <div className="type-line"><span id="type" /><span className="caret" /></div>
              <p className="lead">Small, considered things across every part of modern life. Digital, physical, or both.</p>
              <div className="bsc-cluster">
                <a className="btn btn-primary" href="#join" data-l="Join the waitlist →">Join the waitlist →</a>
                <a className="btn btn-ghost" href="#how">How it works</a>
              </div>
              <p className="fine">No spam. Just the drops. Unsubscribe anytime.</p>
              <div className="ticker-strip">
                <span><i className="dot" /> Systems nominal</span><span>· Waitlist open</span><span>· Drop 001 loading</span>
              </div>
            </div>

            <div className="artifact reveal d2">
              <div className="card r-founder holo" id="tcard">
                <span className="corner c1" /><span className="corner c2" />
                <div className="bsc-split">
                  <div className="top">Byte&nbsp;Sized&nbsp;Co.<br />Certificate&nbsp;of&nbsp;Edition</div>
                  <div className="seal">B</div>
                </div>
                <div>
                  <div className="rar founder" style={{ marginBottom: 13 }}><span className="gem">◆◆◆</span> Founder Edition</div>
                  <div className="no">No.&nbsp;007<span>/050</span></div>
                  <div className="hash">DROP::OCTET · 0x9F3A·C21E</div>
                </div>
                <div className="bsc-split bsc-split-end">
                  <div className="meta">Physical&nbsp;+&nbsp;Digital</div>
                  <div className="meta">Tap&nbsp;to&nbsp;unlock&nbsp;→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}
