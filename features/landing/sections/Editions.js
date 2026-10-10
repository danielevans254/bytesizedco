import SectionLabel from "@/components/ui/SectionLabel";
import { EDITIONS } from "../content";

export default function Editions() {
  return (
    <section id="editions">
      <div className="wrap reveal">
        <SectionLabel index="04">THE EDITIONS</SectionLabel>
        <h2>Not all editions are equal.</h2>
        <p className="lead u-mt-4">Collectible releases can use rarity tiers in any format. The lowest numbers are Founder editions, with the most distinctive treatment or bonus content.</p>
        <div className="editions">
          {EDITIONS.map((e, i) => (
            <div className={"card flat " + e.cls} key={i}>
              <span className="corner c1" /><span className="corner c2" />
              <div className="bsc-split">
                <div className="top">Byte&nbsp;Sized&nbsp;Co.<br />Certificate&nbsp;of&nbsp;Edition</div>
                <div className="seal">B</div>
              </div>
              <div>
                <div className={"rar " + e.rc} style={{ marginBottom: 13 }}><span className="gem">{e.gem}</span> {e.tier}</div>
                <div className="no">No.&nbsp;{e.no}<span>/{e.of}</span></div>
                <div className="hash">DROP::OCTET · {e.hash}</div>
              </div>
              <div className="bsc-split bsc-split-end">
                <div className="meta">Physical&nbsp;+&nbsp;Digital</div>
                <div className="meta">{e.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rar-legend">
          <span><i className="g f" />Founder&nbsp;<b>001–050</b></span>
          <span><i className="g r" />Rare&nbsp;<b>051–150</b></span>
          <span><i className="g s" />Standard&nbsp;<b>151–500</b></span>
          <span className="u-text-accent">↳ lower number, rarer card</span>
        </div>
      </div>
    </section>
  );
}
