// Waitlist counter. Hidden until useLandingEffects has a real total (#count),
// because "0 on the list" is anti-proof.
export default function Proof() {
  return (
    <section className="proof">
      <div className="wrap reveal">
        <span className="kicker">// JOINED</span>
        <div className="counter" style={{ display: "none" }}><span id="count">0</span><span className="accent"> on the list</span></div>
        <div className="ticker-strip" style={{ justifyContent: "center", marginTop: 24 }}>
          <span><i className="dot" /> Systems nominal</span><span>· Waitlist open</span><span>· Founding spots: 500</span>
        </div>
      </div>
    </section>
  );
}
