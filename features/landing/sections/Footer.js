import Brand from "@/components/ui/Brand";
import { COMPANY, SOCIAL_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-cta">
          <p className="foot-slogan"><b>Your world, simplified.</b> Small, considered things across every part of modern life. Digital, physical, or both.</p>
          <a className="btn btn-primary" href="#join" data-l="Join the waitlist →">Join the waitlist →</a>
        </div>
        <div className="foot-inner">
          <Brand href="#top" />
          <div className="foot-links">
            <a href="#manifesto">About</a>
            <a href="#join">Contact</a>
            {/* Shared with the email footers via lib/site.js; each renders only once its env var is set. */}
            {SOCIAL_LINKS.map(({ short, href }) => (
              <a key={short} href={href} target="_blank" rel="noopener noreferrer">{short}</a>
            ))}
          </div>
        </div>
        <div className="foot-status"><i className="dot" /> SYSTEMS NOMINAL · WAITLIST OPEN · DROP 001 LOADING</div>
        <div className="copy">© 2026 {COMPANY.name} · {COMPANY.tagline}</div>
      </div>
    </footer>
  );
}
