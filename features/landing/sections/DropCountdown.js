import { HAS_DEADLINE } from "../drop";

// Rendered only when NEXT_PUBLIC_DROP_DEADLINE is set; useLandingEffects ticks
// #countdown and hides #drop once the deadline passes.
export default function DropCountdown() {
  if (!HAS_DEADLINE) return null;
  return (
    <section id="drop" className="countdown-strip">
      <div className="wrap reveal">
        <span className="kicker">// DROP 001 LANDS IN</span>
        <div className="countdown" id="countdown">
          <div className="cd"><div className="num" data-d>00</div><div className="lbl">Days</div></div>
          <div className="cd"><div className="num" data-h>00</div><div className="lbl">Hrs</div></div>
          <div className="cd"><div className="num" data-m>00</div><div className="lbl">Min</div></div>
          <div className="cd"><div className="num" data-s>00</div><div className="lbl">Sec</div></div>
        </div>
      </div>
    </section>
  );
}
