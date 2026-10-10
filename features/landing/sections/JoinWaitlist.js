import { INTERESTS } from "../content";
import { joinWaitlist, toggleChip } from "../waitlistForm";

// The closing waitlist form (#join) with interest chips and the founding pass.
export default function JoinWaitlist() {
  return (
    <section id="join" className="closer">
      <div className="wrap reveal">
        <div className="closer-grid">
          <div>
            <span className="kicker">// GET IN EARLY</span>
            <h2 className="u-mt-4">Claim your founding number.</h2>
            <p className="lead u-mt-4">The first 500 lock in founding-member pricing on Drop 001, and a member number that&apos;s yours forever.</p>
            <div className="chips-label">What are you into? <span className="u-text-normal">(optional, tunes your feed)</span></div>
            <div className="chips">
              {INTERESTS.map((label) => (
                <button type="button" key={label} className="chip" onClick={toggleChip}>{label}</button>
              ))}
            </div>
            <form className="field u-mt-5" onSubmit={joinWaitlist}>
              <input type="email" placeholder="you@email.com" aria-label="Email" required />
              <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <button className="btn btn-primary" type="submit" data-l="Get in early →">Get in early →</button>
            </form>
            <p className="perk">First 500 = founding-member pricing. Built byte by byte.</p>
          </div>
          <div className="pass">
            <span className="corner c1" /><span className="corner c2" />
            <div className="bsc-split">
              <div className="ph">Byte&nbsp;Sized&nbsp;Co.<br />Founding&nbsp;Member</div>
              <div className="seal">B</div>
            </div>
            <div className="pno">No.&nbsp;001<span>/500</span></div>
            <div className="pmeta">Private Reserve · Lifetime rate</div>
            <div className="prow">
              <div className="ph">Early&nbsp;access · Every&nbsp;drop</div>
              <div className="ph u-text-accent">ACTIVE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
