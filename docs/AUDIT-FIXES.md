# Prototype audit — prioritized fixes

From the gstack consolidated audit (2026-06-27). P0 = poisons the live validation
signal, fix before any paid traffic. P1 = needed before prod. P2 = quality.

## P0 — done

- [x] **Counter showed the global total as a personal "#N".** `route.js` returned
      `number = total`; `page.js` rendered "You're #<total>". Beehiiv has no
      per-subscriber position, so the rank was a lie. Now returns `number:null`
      → UI says "You're on the list", counter still uses `total`.
      (`app/api/waitlist/route.js`, `features/landing/LandingPage.js`)
- [x] **Countdown reset on every reload** (`end = Date.now() + 14d`). Anchored to a
      fixed `DROP_DEADLINE`, overridable via `NEXT_PUBLIC_DROP_DEADLINE` (ISO 8601).
      (`features/landing/LandingPage.js`)
- [x] **Counter could read "0 on the list"** (anti-proof). Counter now stays hidden
      until the API returns a real number > 0. (`features/landing/LandingPage.js`)

## P1 — before production

- [x] **Returning emails surfaced as a red error.** Now maps Beehiiv's
      "already exists" (status 409 / message match) to a friendly `alreadyJoined`
      response; UI says "You're already in". Kept `reactivate_existing:false` so
      unsubscribers aren't silently resurrected. **Verify against a real duplicate
      signup** — the match is heuristic on Beehiiv's error shape. (`route.js`)
- [x] **File store did NOT silently no-op on serverless, it 500'd the waitlist.**
      This entry previously said "silently no-op", which is why it sat unprioritised.
      Actual behaviour: with the Beehiiv vars absent, POST fell through to the local
      file store, which calls `fs.mkdir(process.cwd()/data)`. Everything outside
      `/tmp` is read-only on Vercel, so it threw EROFS uncaught and returned a 500
      with an empty body for every valid email. Live from the 2026-08-19 deploy until
      2026-10-08. `writeStore` now reports failure instead of throwing, and the route
      answers a handled 503 rather than claiming success it cannot deliver. Guard
      against recurrence: `npm run check:waitlist`. (`route.js:43-58`, `route.js:138-148`)
- [ ] **Rate limit still no-ops across serverless instances** (in-memory `Map`).
      The real Beehiiv endpoint is effectively unthrottled in prod. Move throttling
      to a shared store (Upstash/Vercel KV). (Stale-IP eviction added as a stopgap,
      but cross-process throttling still needs KV.) (`ratelimit.js`)
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
