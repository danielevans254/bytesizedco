export const metadata = {
  title: "404 · Signal lost · Byte Sized Co.",
};

export default function NotFound() {
  return (
    <section style={{ minHeight: "82vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <span className="tick tl" />
      <span className="tick tr" />
      <div className="wrap">
        <span className="kicker">// ERROR 404 · SIGNAL LOST</span>
        <h1 style={{ fontSize: "clamp(72px,18vw,200px)", margin: "20px 0 0", lineHeight: 0.9 }}>404</h1>
        <h2 style={{ marginTop: 10 }}>This isn&apos;t in the catalog.</h2>
        <p className="lead" style={{ margin: "18px auto 0" }}>
          The page you&apos;re after may not have dropped yet, or it sold out and went quiet.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/" data-l="← Back to base">← Back to base</a>
          <a className="btn btn-ghost" href="/#join">Join the waitlist</a>
        </div>
        <div className="foot-status" style={{ justifyContent: "center", marginTop: 40 }}>
          <i className="dot" /> SYSTEMS NOMINAL · ROUTE NOT FOUND · WAITLIST OPEN
        </div>
      </div>
    </section>
  );
}
