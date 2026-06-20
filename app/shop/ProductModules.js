"use client";
import { useState } from "react";
import Modal from "./Modal";

/* smoothly-animated accordion (grid-rows 0fr→1fr) */
function Accordion({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={"mod-acc2" + (open ? " open" : "")}>
      <button className="mod-sum" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {title}<span className="pm">+</span>
      </button>
      <div className="mod-wrap"><div className="mod-inner"><div className="mod-pad">{children}</div></div></div>
    </div>
  );
}

const TITLES = {
  materials: "Details",
  whatsInBox: "What's in the box",
  sizeGuide: "Size guide",
  tracklist: "Tracklist",
  audio: "Preview",
  howToPlay: "How to play",
  sample: "Read a sample",
  packing: "What's inside",
  program: "The program",
};

/* ---- inline (accordion) renderers ---- */
function KV({ rows }) {
  return (
    <div className="mod-kv">
      {rows.map(([k, v]) => (
        <div className="mod-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
      ))}
    </div>
  );
}
function Bullets({ items }) {
  return <ul className="mod-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}
function Tracklist({ data }) {
  return (
    <div className="tracklist">
      {data.tracks.map(([n, t, len]) => (
        <div className="track" key={n}><span className="tn">{n}</span><span className="tt">{t}</span><span className="tl">{len}</span></div>
      ))}
      <div className="track-foot">Total runtime · {data.runtime}</div>
    </div>
  );
}
function HowToPlay({ data }) {
  return (
    <>
      <div className="play-badges"><span>{data.players} players</span><span>{data.time}</span></div>
      <ol className="mod-steps">{data.steps.map((s) => <li key={s}>{s}</li>)}</ol>
    </>
  );
}
function Program({ data }) {
  return (
    <div className="program">
      {data.weeks.map(([w, d]) => (
        <div className="pw" key={w}><span className="pw-n">{w}</span><span className="pw-d">{d}</span></div>
      ))}
    </div>
  );
}
function AudioPreview({ data }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="audio">
      <button className={"audio-btn" + (playing ? " on" : "")} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="audio-wave">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className={"wv" + (playing ? " live" : "")} style={{ height: 6 + ((i * 7) % 22) + "px", animationDelay: (i % 10) * 0.08 + "s" }} />
        ))}
      </div>
      <span className="audio-label">{data.label}</span>
    </div>
  );
}

/* ---- modal renderers ---- */
function SizeGuide({ data }) {
  return (
    <>
      <table className="size-table">
        <thead><tr>{data.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{data.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table>
      {data.note && <p className="fine" style={{ marginTop: 16 }}>{data.note}</p>}
    </>
  );
}
function Sample({ data }) {
  return (
    <div className="sample">
      {Array.from({ length: data.spreads || 3 }).map((_, s) => (
        <div className="spread" key={s}>
          {[0, 1].map((pg) => (
            <div className="page" key={pg}>
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="ln" style={{ width: (i === 0 ? 60 : 55 + ((i * 13) % 40)) + "%", background: i === 0 ? "var(--accent)" : "var(--line-hi)" }} />
              ))}
            </div>
          ))}
        </div>
      ))}
      <p className="fine" style={{ textAlign: "center" }}>A few spreads from the edition.</p>
    </div>
  );
}

function ModuleBody({ m }) {
  switch (m.type) {
    case "materials": return <KV rows={m.data.rows} />;
    case "whatsInBox":
    case "packing": return <Bullets items={m.data.items} />;
    case "tracklist": return <Tracklist data={m.data} />;
    case "howToPlay": return <HowToPlay data={m.data} />;
    case "program": return <Program data={m.data} />;
    case "audio": return <AudioPreview data={m.data} />;
    case "sizeGuide": return <SizeGuide data={m.data} />;
    case "sample": return <Sample data={m.data} />;
    default: return null;
  }
}

export default function ProductModules({ modules = [] }) {
  const [openId, setOpenId] = useState(null);
  if (!modules.length) return null;

  const inline = modules.filter((m) => m.display !== "modal");
  const modal = modules.filter((m) => m.display === "modal");

  return (
    <div className="modules">
      {/* modal triggers as a row of buttons */}
      {modal.length > 0 && (
        <div className="mod-triggers">
          {modal.map((m, i) => (
            <button key={i} className="btn btn-ghost" onClick={() => setOpenId(`${m.type}-${i}`)}>
              {m.title || TITLES[m.type] || "View"} →
            </button>
          ))}
        </div>
      )}

      {/* inline accordions */}
      {inline.map((m, i) => {
        const audio = m.type === "audio";
        return audio ? (
          <div className="mod-audio" key={i}><ModuleBody m={m} /></div>
        ) : (
          <Accordion key={i} title={m.title || TITLES[m.type] || "Details"} defaultOpen={i === 0}>
            <ModuleBody m={m} />
          </Accordion>
        );
      })}

      {/* modals */}
      {modal.map((m, i) => (
        <Modal key={i} open={openId === `${m.type}-${i}`} onClose={() => setOpenId(null)} title={m.title || TITLES[m.type] || "Details"}>
          <ModuleBody m={m} />
        </Modal>
      ))}
    </div>
  );
}
