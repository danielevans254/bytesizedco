import Brand from "@/components/ui/Brand";
import { HAS_DEADLINE } from "../drop";

export default function Nav() {
  return (
    <nav id="nav">
      <div className="wrap nav-inner">
        <Brand href="#top" />
        <div className="nav-links">
          <a className="link" href="#manifesto">Manifesto</a>
          <a className="link" href="#how">How it works</a>
          <a className="link" href="#pillars">Departments</a>
          <a className="link" href="/shop">Shop</a>
          {HAS_DEADLINE && <a className="link" href="#drop">Drop 001</a>}
          <a className="btn btn-primary btn-sm" href="#join" data-l="Join waitlist">Join waitlist</a>
        </div>
      </div>
    </nav>
  );
}
