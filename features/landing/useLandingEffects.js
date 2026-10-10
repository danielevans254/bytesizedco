/* Client-side behaviour for the landing page, wired to the server-rendered markup
   by element id and class: boot intro, nav state and scroll progress, cursor glow,
   magnetic buttons, typewriter, card tilt, holographic foil, scroll reveal, live
   waitlist counter and the Drop 001 countdown. Everything is cleaned up on unmount
   and respects prefers-reduced-motion. */

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { BOOT_LINES, TYPE_PHRASES } from "./content";
import { DROP_DEADLINE, HAS_DEADLINE } from "./drop";

export function useLandingEffects() {
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
        const lines = BOOT_LINES;
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
    const phrases = TYPE_PHRASES;
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
}
