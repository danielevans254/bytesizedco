# Prototype audit — prioritized fixes

From the gstack consolidated audit (2026-06-27). P0 = poisons the live validation
signal, fix before any paid traffic. P1 = needed before prod. P2 = quality.

## P0 — done

- [x] **Counter showed the global total as a personal "#N".** `route.js` returned
      `number = total`; `page.js` rendered "You're #<total>". Beehiiv has no
      per-subscriber position, so the rank was a lie. Now returns `number:null`
      → UI says "You're on the list", counter still uses `total`.
      (`app/api/waitlist/route.js`, `app/page.js`)
- [x] **Countdown reset on every reload** (`end = Date.now() + 14d`). Anchored to a
      fixed `DROP_DEADLINE`, overridable via `NEXT_PUBLIC_DROP_DEADLINE` (ISO 8601).
      (`app/page.js`)
- [x] **Counter could read "0 on the list"** (anti-proof). Counter now stays hidden
      until the API returns a real number > 0. (`app/page.js`)

## P1 — before production

- [x] **Returning emails surfaced as a red error.** Now maps Beehiiv's
      "already exists" (status 409 / message match) to a friendly `alreadyJoined`
      response; UI says "You're already in". Kept `reactivate_existing:false` so
      unsubscribers aren't silently resurrected. **Verify against a real duplicate
      signup** — the match is heuristic on Beehiiv's error shape. (`route.js`)
- [ ] **Rate limit + file store silently no-op on serverless** (in-memory `Map`,
      local FS). The real Beehiiv endpoint is effectively unthrottled in prod.
      Move throttling/persistence to a shared store (Upstash/Vercel KV). (Stale-IP
      eviction added as a stopgap, but cross-process throttling still needs KV.)
      (`route.js:89-96`)
- [ ] **`join()` mutates the DOM imperatively** (`btn.textContent`, `btn.style`,
      `input.placeholder`). Convert to React state (status / number / error).
      (`page.js:225-267`)
- [ ] **Entire landing is one `"use client"` component.** Split into a server shell
      with small client islands to cut bundle and gain SSR. (`page.js`)

## P2 — quality

- [x] Duplicated "build standard variant" logic — extracted `buildDefaultCartItem`.
      (`CartDrawer.js:33-43`, `QuickAdd.js:14-39`)
- [ ] Unvalidated `localStorage` cart hydration — validate item shape, clamp
      `price`/`qty`. (`cart.js:14-18`)
- [ ] Closed cart drawer keeps focusable links — add `inert` (or unmount) when
      `!open`. (`CartDrawer.js:54`)
- [x] Rate-limit `Map` never evicted stale IPs — now prunes expired windows on
      each call. (`route.js`)
- [x] Placeholder social links — links now render only when an environment URL exists.
      (`page.js`)
- [x] Two accents — Byte Green is now the only general-purpose accent; Rare uses a
      neutral metallic token instead of cyan.
      (`globals.css:11`)

## Notes

- Secrets are handled correctly: `BEEHIIV_API_KEY`/`BEEHIIV_PUBLICATION_ID` are
  server-only (no `NEXT_PUBLIC_`), `.env.local` is gitignored.
- "Units left" is a deterministic hash (`config.js`) — cosmetic, SSR-safe by
  design. Fine for a prototype; wire to real inventory only when commerce is live.
