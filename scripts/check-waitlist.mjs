#!/usr/bin/env node
/* Verify the waitlist endpoint is actually capturing signups.
 *
 *   node scripts/check-waitlist.mjs                        # defaults to production
 *   node scripts/check-waitlist.mjs http://localhost:3000
 *   node scripts/check-waitlist.mjs --live-signup          # also posts a real signup
 *
 * Why this exists: on 2026-10-08 POST /api/waitlist returned 500 for every valid
 * email in production. BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID were set in
 * .env.local but never added to Vercel, so beehiivOn was false and the route fell
 * through to the dev-only file store, which calls fs.mkdir into process.cwd().
 * Everything outside /tmp is read-only on Vercel, so that threw EROFS uncaught.
 * AUDIT-FIXES.md called this a silent no-op; it was a hard outage.
 *
 * The decisive signal is free: GET /api/waitlist reports which backend answered.
 * "local" against a deployed host means the file store is in play, and the file
 * store cannot work on serverless. That check alone would have caught the outage.
 *
 * No dependencies: built-in fetch only. Default run writes nothing anywhere.
 */

const args = process.argv.slice(2);
const liveSignup = args.includes("--live-signup");
const target = (args.find((a) => !a.startsWith("--")) || "https://bytesizedco.com")
  .trim()
  .replace(/\/$/, "");

const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(target);

const PASS = "  ok  ";
const WARN = " warn ";
const FAIL = " fail ";

let failures = 0;
let warnings = 0;

function line(state, label, detail) {
  if (state === FAIL) failures++;
  if (state === WARN) warnings++;
  console.log(`[${state}] ${label}${detail ? `\n         ${detail}` : ""}`);
}

function section(title) {
  console.log(`\n${title}\n${"-".repeat(title.length)}`);
}

async function post(body) {
  const res = await fetch(`${target}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* an empty body is itself the signal: handled errors always return JSON */
  }
  return { status: res.status, json };
}

section(`Which backend is answering  (${target})`);
try {
  const res = await fetch(`${target}/api/waitlist`);
  const info = await res.json();
  if (info.source === "beehiiv") {
    line(PASS, `source: beehiiv, ${info.count} subscriber(s)`, "Signups reach the sending platform.");
  } else if (info.source === "local" && isLocal) {
    line(WARN, "source: local file store", "Fine for dev. Set the Beehiiv vars to exercise the real path.");
  } else if (info.source === "local") {
    line(
      FAIL,
      "source: local file store on a deployed host",
      "BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are missing from this environment. " +
        "The file store cannot persist on serverless, so signups are being lost. " +
        "Add both in Vercel (no surrounding quotes) and redeploy."
    );
  } else {
    line(FAIL, `unexpected source: ${String(info.source)}`, JSON.stringify(info));
  }
} catch (e) {
  line(FAIL, "GET /api/waitlist failed", String(e?.message || e));
}

section("Paths that must never touch the filesystem");
try {
  const { status, json } = await post({ email: "check-script@example.com", website: "bot" });
  if (status === 200 && json?.ok) line(PASS, "honeypot returns 200 and stores nothing");
  else line(FAIL, `honeypot returned ${status}`, JSON.stringify(json));
} catch (e) {
  line(FAIL, "honeypot request failed", String(e?.message || e));
}

try {
  const { status, json } = await post({ email: "not-an-email" });
  if (status === 400 && json?.error) line(PASS, "invalid email returns 400 with JSON");
  else line(FAIL, `invalid email returned ${status}`, JSON.stringify(json));
} catch (e) {
  line(FAIL, "invalid-email request failed", String(e?.message || e));
}

if (liveSignup) {
  section("Live signup (writes for real)");
  const addr = `check-${Date.now()}@example.com`;
  try {
    const { status, json } = await post({ email: addr, source: "landing" });
    if (status === 500) {
      line(
        FAIL,
        "valid email returned 500",
        "This is the original regression: an unhandled throw in the persistence path. " +
          "A configuration problem must degrade to a handled 503, never a 500."
      );
    } else if (status === 503) {
      line(
        WARN,
        "valid email returned 503",
        "Handled correctly, but nothing is storing signups. Set the Beehiiv vars."
      );
    } else if (status === 200 && json?.ok) {
      line(PASS, `valid email accepted (${addr})`, "Remove this address from the list afterwards.");
    } else {
      line(FAIL, `valid email returned ${status}`, JSON.stringify(json));
    }
  } catch (e) {
    line(FAIL, "live signup request failed", String(e?.message || e));
  }
} else {
  section("Live signup");
  line(
    WARN,
    "skipped",
    "Pass --live-signup to post a real address. Omitted by default so the check never adds junk to the list."
  );
}

console.log(`\n${failures} failing, ${warnings} warning(s).\n`);
process.exit(failures ? 1 : 0);
