"use client";
import { useEffect } from "react";
import ProductArt from "./shop/ProductArt";
import { captureAttribution, readAttribution, track } from "./attribution";

/* ---- brand mark ---- */
function Mark({ className }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <path d="M9 8 H7 V24 H9" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <path d="M23 8 H25 V24 H23" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <rect x="13" y="13" width="6" height="6" rx="1" fill="var(--accent-ink)" />
    </svg>
  );
}

const PILLARS = [
  ["// CARRY", "Carry & Everyday", "EDC, desk objects, the small useful things.", "Physical + Digital", ""],
  ["// WEAR", "Wear", "Apparel basics with a point of view.", "Physical + Digital", ""],
  ["// PLAY", "Play", "Card games, stickers, crafts, kits.", "Physical + Digital", ""],
  ["// READ", "Read & Feed", "Books, zines, the newsletter, the feed.", "Physical + Digital", ""],
  ["// SOUND", "Sound & Drive", "Music and cars, the lifestyle thread.", "Physical + Digital", ""],
  ["// OUT", "Out", "Outdoor & activity gear.", "Physical + Digital", ""],
  ["// MOVE", "Move & Fuel", "Fitness, nutrition, recovery, healthy living.", "Physical + Digital", "feat"],
  ["// _", "Whatever's next", "The catalog grows with the curation.", "Coming soon", ""],
];

const EDITIONS = [
  { tier: "Founder Edition", rc: "founder", gem: "◆◆◆", cls: "r-founder holo", no: "003", of: "050", hash: "0x9F3A·C21E", note: "Holographic foil" },
  { tier: "Rare Edition", rc: "rare", gem: "◆◆", cls: "r-rare holo", no: "061", of: "150", hash: "0x7B12·A4D9", note: "Iridescent sheen" },
  { tier: "Standard", rc: "standard", gem: "◆", cls: "", no: "312", of: "500", hash: "0x33C8·5E10", note: "Matte black" },
];

const STATS = [
  ["7", "worlds", false],
  ["500", "units / drop", false],
  ["500", "founding spots", true],
  ["∞", "digital", true],
];

const FEED = [
  ["01", "A pocket tool worth carrying", "The one multi-tool that earns its place. + a desk-setup template."],
  ["02", "The drive playlist", "47 minutes for the good road. Streamed + a printable route card."],
  ["03", "Recovery, simplified", "A banded mini-kit + a 2-week mobility program you actually finish."],
];

const INTERESTS = ["Carry", "Wear", "Play", "Read", "Sound", "Cars", "Outdoors", "Fitness"];

// Fixed Drop 001 deadline so the countdown is real, not a per-load timer.
// Set NEXT_PUBLIC_DROP_DEADLINE (ISO 8601) to switch the countdown on.
// There is deliberately no fallback date: an unset or elapsed deadline hides the
// strip entirely rather than rendering 00:00:00:00. A countdown that isn't
// counting down is fake urgency, which the brand rules out.
const DROP_DEADLINE = Date.parse(process.env.NEXT_PUBLIC_DROP_DEADLINE || "");
const HAS_DEADLINE = Number.isFinite(DROP_DEADLINE);

// Social handles are not registered yet (launch-checklist: "Register matching
// social handles"). Render a link only once its env var is set, so the footer
// never ships dead href="#" links.
const SOCIALS = [
  ["IG", process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM],
  ["TikTok", process.env.NEXT_PUBLIC_SOCIAL_TIKTOK],
  ["X", process.env.NEXT_PUBLIC_SOCIAL_X],
].filter(([, href]) => Boolean(href));


const FAQ = [
  ["What exactly is Byte Sized Co.?", "A curated marketplace for modern utility. We find the genuinely useful things across the worlds we live in (tech, fashion, cars, music, outdoors, fitness) and release them as small, numbered drops."],
  ["What's the “physical + digital” thing?", "Every drop pairs a physical object with a digital companion: a wallpaper set, a template, a program, access. The object you own outright. The companion keeps evolving, and it can't be switched off."],
  ["Are these NFTs or crypto?", "No, definitely not. There's no blockchain, no token, no wallet, nothing to mint or trade. Byte Sized editions are ordinary collectibles: a physical item you own plus a digital companion you keep. Every purchase gives you both, so you grow a physical collection and a digital one together. The cards just mark founding supporters of the store."],
  ["What does the waitlist get me?", "Founding members get guaranteed early access to Drop 001, a permanent low member number, and founding-member pricing. The first 500 only."],
  ["When does Drop 001 land?", "Soon. We're finishing the first pairing now. Join the list and you'll be first to know, before it's public."],
];

// FAQ rich-result markup, built from the same array the section renders so the two
// can never drift apart. "<" is escaped so an answer can never close the tag early.
const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}).replace(/</g, "\\u003c");

export default function Page() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Record the traffic source before anything can navigate away from it.
    captureAttribution();

    // ---- BOOT intro ----
    const boot = document.getElementById("boot");
    const out = document.getElementById("bootlines");
    let bootTimers = [];
    const finishBoot = () => { if (boot) { boot.classList.add("done"); bootTimers.push(setTimeout(() => (boot.style.display = "none"), 600)); } };
    if (boot) {
      if (reduce) finishBoot();
      else {
        const lines = [
          ["> initializing curator", "ok"],
          ["> mounting seven worlds", "ok"],
          ["> pairing physical + digital", "ok"],
          ["> rendering Drop 001", "ok"],
          ["> waitlist", "OPEN"],
        ];
        let acc = "";
        lines.forEach(([t, s], i) => {
          bootTimers.push(setTimeout(() => {
            acc += `${t} <span class="ok">${".".repeat(Math.max(2, 26 - t.length))} ${s}</span>\n`;
            out.innerHTML = acc + '<span class="bcaret"></span>';
          }, 230 * (i + 1)));
        });
        bootTimers.push(setTimeout(finishBoot, 230 * (lines.length + 1) + 350));
      }
      boot.addEventListener("click", finishBoot);
    }

    // ---- nav + progress ----
    const nav = document.getElementById("nav");
    const prog = document.getElementById("progress");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", scrollY > 20);
      if (prog) { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; }
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- cursor glow ----
    const cur = document.getElementById("cursor");
    let onMove;
    if (!reduce && matchMedia("(pointer:fine)").matches && cur) {
      onMove = (e) => { cur.style.opacity = 1; cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; };
      addEventListener("mousemove", onMove);
    }

    // ---- magnetic buttons ----
    const mags = [];
    if (!reduce && matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".btn-primary").forEach((b) => {
        const mv = (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`; };
        const lv = () => (b.style.transform = "");
        b.addEventListener("mousemove", mv); b.addEventListener("mouseleave", lv);
        mags.push([b, mv, lv]);
      });
    }

    // ---- typewriter ----
    const phrases = ["small things, done right", "physical + digital, paired", "numbered. limited. yours.", "the good stuff, found for you"];
    const el = document.getElementById("type");
    let typeTimer;
    if (el) {
      if (reduce) el.textContent = phrases[0];
      else {
        let p = 0, c = 0, del = false;
        const t = () => {
          const w = phrases[p];
          el.textContent = del ? w.slice(0, --c) : w.slice(0, ++c);
          let d = del ? 38 : 88;
          if (!del && c === w.length) { d = 1700; del = true; }
          else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; d = 420; }
          typeTimer = setTimeout(t, d);
        };
        t();
      }
    }

    // ---- 3D card tilt ----
    const card = document.getElementById("tcard");
    let art, tilt, leave;
    if (!reduce && card) {
      art = card.closest(".artifact");
      tilt = (e) => { const r = art.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; card.style.transform = `rotateY(${-16 + x * 16}deg) rotateX(${7 - y * 14}deg) translateY(-4px)`; };
      leave = () => (card.style.transform = "");
      art.addEventListener("mousemove", tilt); art.addEventListener("mouseleave", leave);
    }

    // ---- holographic foil: cursor tracking (--mx/--my) ----
    const holos = [];
    if (matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".card.holo").forEach((c) => {
        const mv = (e) => {
          const r = c.getBoundingClientRect();
          c.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          c.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        };
        const lv = () => { c.style.setProperty("--mx", "50%"); c.style.setProperty("--my", "50%"); };
        c.addEventListener("mousemove", mv);
        c.addEventListener("mouseleave", lv);
        holos.push([c, mv, lv]);
      });
    }

    // ---- reveal ----
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((r) => io.observe(r));

    // ---- live count-up (real total from the API, with a seed fallback) ----
    const cnt = document.getElementById("count");
    let liveTotal = 0;
    let countTimer;
    const counter = document.querySelector(".proof .counter");
    fetch("/api/waitlist")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.total === "number") {
          liveTotal = d.total;
          if (cnt && cnt.dataset.counted) cnt.textContent = liveTotal.toLocaleString();
        }
        // Honest social proof: only show the counter once there's a real number.
        // "0 on the list" is anti-proof, so the counter stays hidden until then.
        if (counter) counter.style.display = liveTotal > 0 ? "" : "none";
      })
      .catch(() => {});
    const proof = document.querySelector(".proof");
    const cio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && cnt) {
        cnt.dataset.counted = "1";
        // No real number yet: let the fetch handler fill it in (and reveal the
        // counter) rather than animating to 0.
        if (liveTotal <= 0) { cio.disconnect(); return; }
        if (reduce) { cnt.textContent = liveTotal.toLocaleString(); cio.disconnect(); return; }
        let n = 0, st = Math.max(1, Math.ceil(liveTotal / 64));
        countTimer = setInterval(() => { n += st; if (n >= liveTotal) { n = liveTotal; clearInterval(countTimer); } cnt.textContent = n.toLocaleString(); }, 20);
        cio.disconnect();
      }
    }), { threshold: 0.5 });
    if (proof) cio.observe(proof);

    // ---- countdown (fixed launch deadline, not a per-load timer) ----
    // The strip only renders when NEXT_PUBLIC_DROP_DEADLINE is set, but the
    // deadline can still elapse while a tab sits open. Hide the section rather
    // than let it park at 00:00:00:00.
    const end = DROP_DEADLINE;
    const cd = HAS_DEADLINE ? document.getElementById("countdown") : null;
    const dropStrip = document.getElementById("drop");
    let cdTimer;
    const tickCd = () => {
      if (!cd) return;
      let s = Math.floor((end - Date.now()) / 1000);
      if (s <= 0) {
        if (dropStrip) dropStrip.style.display = "none";
        clearInterval(cdTimer);
        return;
      }
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      const pad = (n) => String(n).padStart(2, "0");
      cd.querySelector("[data-d]").textContent = pad(d);
      cd.querySelector("[data-h]").textContent = pad(h);
      cd.querySelector("[data-m]").textContent = pad(m);
      cd.querySelector("[data-s]").textContent = pad(s);
    };
    tickCd();
    if (!reduce && cd) cdTimer = setInterval(tickCd, 1000);

    return () => {
      bootTimers.forEach(clearTimeout);
      removeEventListener("scroll", onScroll);
      if (onMove) removeEventListener("mousemove", onMove);
      mags.forEach(([b, mv, lv]) => { b.removeEventListener("mousemove", mv); b.removeEventListener("mouseleave", lv); });
      clearTimeout(typeTimer); clearInterval(countTimer); clearInterval(cdTimer);
      io.disconnect(); cio.disconnect();
      if (art) { art.removeEventListener("mousemove", tilt); art.removeEventListener("mouseleave", leave); }
      holos.forEach(([c, mv, lv]) => { c.removeEventListener("mousemove", mv); c.removeEventListener("mouseleave", lv); });
    };
  }, []);

  const toggleChip = (e) => e.currentTarget.classList.toggle("on");

  const join = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="email"]');
    const honey = form.querySelector('input[name="website"]');
    const btn = form.querySelector("button");
    const label = btn.dataset.l;
    const email = input.value.trim();
    const scope = form.closest("#join") || document;
    const interests = Array.from(scope.querySelectorAll(".chip.on")).map((c) => c.textContent.trim());

    const attribution = readAttribution();

    btn.disabled = true;
    btn.textContent = "Joining…";
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honey ? honey.value : "", interests, attribution }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        // The conversion Gate 1 is measured on: targeted sessions -> waitlist submits.
        track("waitlist_submit", {
          source: attribution.utm_source || "direct",
          returning: data.alreadyJoined ? "yes" : "no",
        });
        btn.textContent = data.alreadyJoined
          ? (data.number ? "✓ Already in · #" + data.number : "✓ You're already in")
          : (data.number ? "✓ You're #" + data.number : "✓ You're on the list");
        btn.style.background = "var(--accent-dim)";
        input.value = "";
        input.placeholder = "See you at Drop 001.";
        const c = document.getElementById("count");
        if (c && typeof data.total === "number") c.textContent = data.total.toLocaleString();
      } else {
        btn.textContent = data.error || "Try again";
        btn.style.background = "var(--error)";
      }
    } catch {
      btn.textContent = "Network error";
      btn.style.background = "var(--error)";
    }
    setTimeout(() => {
      btn.textContent = label;
      btn.style.background = "";
      btn.disabled = false;
    }, 2800);
  };

  return (
    <>
      {/* BOOT */}
      <div id="boot">
        <div className="term">
          <div className="head"><span className="glyph">B</span> BYTE SIZED CO. // boot</div>
          <pre id="bootlines" style={{ fontFamily: "inherit", whiteSpace: "pre-wrap", margin: 0 }}></pre>
        </div>
        <div className="skip">click to skip</div>
      </div>

      <div id="progress" />
      <div id="cursor" />

      <nav id="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top"><Mark className="logo-mark" /> Byte&nbsp;Sized&nbsp;Co.</a>
          <div className="nav-links">
            <a className="link" href="#manifesto">Manifesto</a>
            <a className="link" href="#how">How it works</a>
            <a className="link" href="#pillars">Departments</a>
            <a className="link" href="/shop">Shop</a>
            {HAS_DEADLINE && <a className="link" href="#drop">Drop 001</a>}
            <a className="btn btn-primary" href="#join" style={{ height: 40, padding: "0 18px" }} data-l="Join waitlist">Join waitlist</a>
          </div>
        </div>
      </nav>

      <header id="top">
        <section className="hero">
          <span className="tick tl" /><span className="tick tr" />
          <div className="wrap">
            <div className="hero-grid">
              <div className="reveal">
                <span className="kicker">// PRE-LAUNCH · WAITLIST OPEN</span>
                <h1>Your world,<br /><span className="stroke">simplified.</span></h1>
                <div className="type-line"><span id="type" /><span className="caret" /></div>
                <p className="lead">The marketplace for modern utility, connecting the physical and digital elements of your busy life.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a className="btn btn-primary" href="#join" data-l="Join the waitlist →">Join the waitlist →</a>
                  <a className="btn btn-ghost" href="#how">How it works</a>
                </div>
                <p className="fine">No spam. Just the drops. Unsubscribe anytime.</p>
                <div className="ticker-strip">
                  <span><i className="dot" /> Systems nominal</span><span>· Waitlist open</span><span>· Drop 001 loading</span>
                </div>
              </div>

              <div className="artifact reveal d2">
                <div className="card r-founder holo" id="tcard">
                  <span className="corner c1" /><span className="corner c2" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="top">Byte&nbsp;Sized&nbsp;Co.<br />Certificate&nbsp;of&nbsp;Edition</div>
                    <div className="seal">B</div>
                  </div>
                  <div>
                    <div className="rar founder" style={{ marginBottom: 13 }}><span className="gem">◆◆◆</span> Founder Edition</div>
                    <div className="no">No.&nbsp;007<span>/050</span></div>
                    <div className="hash">DROP::OCTET · 0x9F3A·C21E</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div className="meta">Physical&nbsp;+&nbsp;Digital</div>
                    <div className="meta">Tap&nbsp;to&nbsp;unlock&nbsp;→</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      {HAS_DEADLINE && (
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
      )}

      <section id="manifesto">
        <div className="wrap">
          <div className="manifesto-grid">
            <div className="reveal">
              <div className="label"><span className="kicker dim">01 / WHAT WE BELIEVE</span></div>
              <h2>Curation is the product.<br />Taste is the feature.</h2>
              <p className="lead" style={{ marginTop: 22, color: "var(--muted)" }}>A generalist&apos;s marketplace, tied together by one point of view. Not a category, a curator.</p>
            </div>
            <div className="reveal d1">
              <div className="rows">
                <div className="m-row"><span className="n">01</span><span>Everything you&apos;re into deserves better than scattered tabs and noise.</span></div>
                <div className="m-row"><span className="n">02</span><span>Useful beats trendy. <em>Always.</em></span></div>
                <div className="m-row"><span className="n">03</span><span>The best things live in two worlds: <em>physical and digital.</em></span></div>
                <div className="m-row"><span className="n">04</span><span>Small things, done right. Numbered, limited, <em>worth owning.</em></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap reveal">
          <div className="label"><span className="kicker dim">02 / HOW IT WORKS</span></div>
          <h2>Three steps, on repeat.</h2>
          <div className="steps">
            <div className="step"><span className="ghost">01</span><span className="sn">// SUBSCRIBE</span><h3>Join the feed</h3><p>A free weekly read. The good stuff, found for you. No noise, no selling. Just taste.</p></div>
            <div className="step"><span className="ghost">02</span><span className="sn">// SENSE</span><h3>We read the room</h3><p>What you click and love tells us what to make, so we only ever build what you actually want.</p></div>
            <div className="step"><span className="ghost">03</span><span className="sn">// DROP</span><h3>The drop lands</h3><p>A numbered, limited object + its digital companion. You get first access. It sells out. Repeat.</p></div>
          </div>
        </div>
      </section>

      <section id="signature">
        <div className="wrap reveal">
          <div className="label"><span className="kicker">03 / THE SIGNATURE</span></div>
          <h2>One thing, two worlds.</h2>
          <p className="lead" style={{ marginTop: 16 }}>Every drop pairs a physical object with a digital companion that keeps evolving. The object you own. The companion grows, and can&apos;t be switched off.</p>
          <div className="sig">
            <div className="sig-card">
              <div className="sig-art phys"><ProductArt variant="play" /></div>
              <span className="tag">Physical</span><h3>A numbered sticker pack</h3>
              <p>Die-cut, matte, limited to 500, with an edition number on the card.</p>
            </div>
            <div className="sig-join">+</div>
            <div className="sig-card">
              <div className="sig-art digi"><ProductArt variant="play" companion /></div>
              <span className="tag">Digital</span><h3>An evolving wallpaper set</h3>
              <p>Unlocked by the card&apos;s code. New drops add to the same space you own.</p>
            </div>
          </div>
          <p className="sig-eq">Physical <b>+</b> Digital <b>=</b> one thing</p>
        </div>
      </section>

      <section id="editions">
        <div className="wrap reveal">
          <div className="label"><span className="kicker dim">04 / THE EDITIONS</span></div>
          <h2>Not all editions are equal.</h2>
          <p className="lead" style={{ marginTop: 16 }}>Every drop is split into rarity tiers. The lowest numbers are Founder editions: holographic foil, gold seal, the real collectible. The rarer the card, the rarer the digital companion it unlocks.</p>
          <div className="editions">
            {EDITIONS.map((e, i) => (
              <div className={"card flat " + e.cls} key={i}>
                <span className="corner c1" /><span className="corner c2" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="top">Byte&nbsp;Sized&nbsp;Co.<br />Certificate&nbsp;of&nbsp;Edition</div>
                  <div className="seal">B</div>
                </div>
                <div>
                  <div className={"rar " + e.rc} style={{ marginBottom: 13 }}><span className="gem">{e.gem}</span> {e.tier}</div>
                  <div className="no">No.&nbsp;{e.no}<span>/{e.of}</span></div>
                  <div className="hash">DROP::OCTET · {e.hash}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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
            <span style={{ color: "var(--accent)" }}>↳ lower number, rarer card</span>
          </div>
        </div>
      </section>

      <section id="pillars">
        <div className="wrap reveal">
          <div className="label"><span className="kicker dim">05 / THE SEVEN WORLDS</span></div>
          <h2>Everything, with a spine.</h2>
          <p className="lead" style={{ marginTop: 16 }}>Seven departments, one point of view. Each one a physical + digital pairing.</p>
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
          <div style={{ marginTop: 28 }}>
            <a className="btn btn-ghost" href="/shop">Preview the shop →</a>
          </div>
        </div>
      </section>

      <section className="pullquote">
        <div className="wrap reveal">
          <h2>You&apos;re into <em>everything.</em><br />So are we.</h2>
          <div className="by">Byte Sized Co.</div>
        </div>
      </section>

      <section id="feed">
        <div className="wrap reveal">
          <div className="feed-grid">
            <div>
              <div className="label"><span className="kicker dim">06 / THE FEED</span></div>
              <h2>The feed is the heart.</h2>
              <p className="lead" style={{ marginTop: 16 }}>It starts free. A weekly read of six things worth your attention, across every world. Read it, and the drops you actually want write themselves.</p>
              <a className="btn btn-primary" href="#join" data-l="Subscribe free →" style={{ marginTop: 28 }}>Subscribe free →</a>
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

      <section className="proof">
        <div className="wrap reveal">
          <span className="kicker">// JOINED</span>
          <div className="counter" style={{ display: "none" }}><span id="count">0</span><span className="accent"> on the list</span></div>
          <div className="ticker-strip" style={{ justifyContent: "center", marginTop: 24 }}>
            <span><i className="dot" /> Systems nominal</span><span>· Waitlist open</span><span>· Founding spots: 500</span>
          </div>
        </div>
      </section>

      <section id="faq">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }} />
        <div className="wrap reveal">
          <div className="label"><span className="kicker dim">07 / QUESTIONS</span></div>
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

      <section id="join" className="closer">
        <div className="wrap reveal">
          <div className="closer-grid">
            <div>
              <span className="kicker">// GET IN EARLY</span>
              <h2 style={{ marginTop: 16 }}>Claim your founding number.</h2>
              <p className="lead" style={{ marginTop: 16 }}>The first 500 lock in founding-member pricing on Drop 001, and a member number that&apos;s yours forever.</p>
              <div className="chips-label">What are you into? <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional, tunes your feed)</span></div>
              <div className="chips">
                {INTERESTS.map((label) => (
                  <button type="button" key={label} className="chip" onClick={toggleChip}>{label}</button>
                ))}
              </div>
              <form className="field" onSubmit={join} style={{ marginTop: 20 }}>
                <input type="email" placeholder="you@email.com" aria-label="Email" required />
                <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <button className="btn btn-primary" type="submit" data-l="Get in early →">Get in early →</button>
              </form>
              <p className="perk">First 500 = founding-member pricing. Built byte by byte.</p>
            </div>
            <div className="pass">
              <span className="corner c1" /><span className="corner c2" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="ph">Byte&nbsp;Sized&nbsp;Co.<br />Founding&nbsp;Member</div>
                <div className="seal">B</div>
              </div>
              <div className="pno">No.&nbsp;001<span>/500</span></div>
              <div className="pmeta">Private Reserve · Lifetime rate</div>
              <div className="prow">
                <div className="ph">Early&nbsp;access · Every&nbsp;drop</div>
                <div className="ph" style={{ color: "var(--accent)" }}>ACTIVE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-cta">
            <p className="foot-slogan"><b>Your world, simplified.</b> Byte Sized Co. is the marketplace for modern utility, connecting the physical and digital elements of your busy life.</p>
            <a className="btn btn-primary" href="#join" data-l="Join the waitlist →">Join the waitlist →</a>
          </div>
          <div className="foot-inner">
            <a className="brand" href="#top"><Mark className="logo-mark" /> Byte&nbsp;Sized&nbsp;Co.</a>
            <div className="foot-links">
              <a href="#manifesto">About</a>
              <a href="#join">Contact</a>
              {SOCIALS.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
              ))}
            </div>
          </div>
          <div className="foot-status"><i className="dot" /> SYSTEMS NOMINAL · WAITLIST OPEN · DROP 001 LOADING</div>
          <div className="copy">© 2026 Byte Sized Co. · Your world, simplified.</div>
        </div>
      </footer>
    </>
  );
}
