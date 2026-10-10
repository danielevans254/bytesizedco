import SectionLabel from "@/components/ui/SectionLabel";
import { FEED } from "../content";

export default function Feed() {
  return (
    <section id="feed">
      <div className="wrap reveal">
        <div className="feed-grid">
          <div>
            <SectionLabel index="06">THE FEED</SectionLabel>
            <h2>The feed is the heart.</h2>
            <p className="lead u-mt-4">It starts free. A weekly read of six things worth your attention, across every world. Read it, and the drops you actually want write themselves.</p>
            <a className="btn btn-primary u-mt-7" href="#join" data-l="Subscribe free →">Subscribe free →</a>
          </div>
          <div className="issue">
            <div className="issue-head"><span>// THE FEED · ISSUE 001</span><span className="live"><i className="dot" />LIVE</span></div>
            <div className="issue-body">
              {FEED.map(([n, h, p]) => (
                <div className="pick" key={n}><span className="pn">{n}</span><div><h4>{h}</h4><p>{p}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
