import SectionLabel from "@/components/ui/SectionLabel";
import { FAQ, FAQ_JSONLD } from "../content";

export default function Faq() {
  return (
    <section id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }} />
      <div className="wrap reveal">
        <SectionLabel index="07">QUESTIONS</SectionLabel>
        <h2>The short version.</h2>
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <details key={i} open={i === 0}>
              <summary>{q}<span className="pm">+</span></summary>
              <div className="ans">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
