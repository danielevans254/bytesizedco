import SectionLabel from "@/components/ui/SectionLabel";
import { PILLARS, STATS } from "../content";

// "The seven worlds": department pillars and headline stats.
export default function Departments() {
  return (
    <section id="pillars">
      <div className="wrap reveal">
        <SectionLabel index="05">THE SEVEN WORLDS</SectionLabel>
        <h2>Everything, with a spine.</h2>
        <p className="lead u-mt-4">Seven departments, one point of view. Each can hold digital products, physical goods, or a signature pairing.</p>
        <div className="grid7">
          {PILLARS.map(([dept, h, p, pd, feat]) => (
            <div className={"pillar " + feat} key={dept}>
              <span className="dept">{dept}</span>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="pd">{pd}</span>
            </div>
          ))}
        </div>
        <div className="stats">
          {STATS.map(([v, k, a]) => (
            <div className="stat" key={k}><div className={"v" + (a ? " accent" : "")}>{v}</div><div className="k">{k}</div></div>
          ))}
        </div>
        <div className="u-mt-7">
          <a className="btn btn-ghost" href="/shop">Preview the shop →</a>
        </div>
      </div>
    </section>
  );
}
