/* Waitlist form behaviour for the landing page: interest chips and the submit
   handler that posts to /api/waitlist and reports the Gate 1 conversion. */

import { readAttribution, track } from "@/lib/attribution";

export const toggleChip = (e) => e.currentTarget.classList.toggle("on");

export const joinWaitlist = async (e) => {
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
