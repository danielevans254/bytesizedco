# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Next.js 14 (App Router) **pre-launch landing page + sample shop** for *Byte Sized Co.*, a
curated-commerce brand. This is a **prototype** — no real payments. The only live backends are the
waitlist and preorder routes, each env-gated (Beehiiv list, optional Supabase copy, optional Resend
mail). The strategy/brainstorm knowledge base lives in a separate Obsidian vault at
`../bytesizeco` (markdown only; not part of this app). This directory is its own git repo
(branch `main`; remote `bytesizedco/bytesizedco`), nested inside the
untracked workspace at `..`; the workspace-level `../CLAUDE.md` describes the surrounding folders.

Deploys go to Vercel team `byte-sized-co`, project `bytesizedco-cww5`, which auto-deploys `main` from GitHub (`.vercel/project.json`, `vercel.json`).
The workspace skill `/deploy-web` and `../.claude/memory/vercel-project.md` hold the account rules,
including the Hobby-plan author check that blocks deployments authored by `danielevans254`.

## Commands

```bash
npm run dev      # http://localhost:3000 (App Router dev server)
npm run build    # production build — run this to verify before considering work done
npm run start    # serve the production build
npm run lint     # next lint
npm run check:dns  # MX, SPF, DKIM, DMARC for bytesizedco.com plus mail. and send. subdomains (see EMAIL-SETUP.md)
npm run check:waitlist   # read-only probe of production /api/waitlist (pass a URL to target another host)
```

Plain **JavaScript, not TypeScript**. Import alias `@/*` maps to repo root (`jsconfig.json`).
There is no test suite.

## Architecture

### Data-driven shop engine (`app/shop/`)
The shop is **declarative**: products are data, components are generic renderers. To add or change
a product you edit data, not JSX.

- `products.js` — the `RAW` array is the single source of truth. Each product declares:
  - `format` — `digital`, `physical`, or `hybrid` (defaults to `hybrid`). Never hard-code the customer-facing format label in a component.
  - `tiers` — rarity editions (Standard ◆ / Rare ◆◆ / Founder ◆◆◆) via the `tiers(base)` helper; used by collectible products.
  - `options[]` — typed variant axes (`swatch`, `size`, `format`, `bundle`, `level`, `text`, `toggle`), each with optional `priceDelta`.
  - `modules[]` — content blocks (`materials`, `whatsInBox`, etc.) rendered `inline` (accordion) or in a `modal`.
- `ProductConfigurator.js` renders `options[]`; `ProductModules.js` renders `modules[]`. They switch on `type`/`display` — extend these when adding a new option/module type.
- `config.js` — shared constants + **deterministic, SSR-safe** helpers, including product-format labels and default cart items. It must never use `Date`/`Math.random` (would cause hydration mismatch); "units left" and floor price are derived from a string `hash()`.
- `ProductArt.js` — **procedural SVG art, no photos.** `variant` selects the department motif; `companion` renders the digital-file motif; `color` tints it. Reused on the landing page too (pure component, no `"use client"`).
- `cart.js` — cart state via React Context + `localStorage` (key `bsc-cart`); slide-out `CartDrawer.js`; demo `checkout/`. Cart item `id` encodes tier + chosen options so variants are distinct lines.

### Landing page
- `app/page.js` — single-file `"use client"` landing (hero, countdown strip, manifesto, signature "two worlds" section, waitlist). The countdown uses one `#countdown` element driven by inline JS.
- `DESIGN.md` — the company-wide visual source of truth. Read it before visual work.
- `app/design-system/tokens.css` — canonical colors, type, spacing, shape, elevation, and motion tokens.
- `app/design-system/primitives.css` — reusable composition helpers and state utilities.
- `app/globals.css` — existing landing/shop compositions. New shared foundations belong in `app/design-system/`, not in this file.
- `app/ui/` — shared brand, section-label, and product-format primitives.

### API routes and server helpers (`app/api/`, `app/lib/`)
- **Three dependencies, by design.** `package.json` lists only `next`, `react`, `react-dom`. Beehiiv, Supabase (PostgREST) and Resend are called with hand-rolled `fetch` in `app/lib/`. Don't add an SDK for them.
- **Every helper is env-gated and best-effort.** `beehiiv.js` (`beehiivOn`), `store.js` (`storeOn`), `email.js` (`emailOn`) and `ratelimit.js` skip silently when their env vars are missing and never throw. A provider outage costs a row, never a signup. The env var reference is in `README.md`; DNS and email wiring is in `EMAIL-SETUP.md`.
- `app/site.js` — exports `SITE_URL`, the one place the public origin is defined. Derive display hosts and referrers from it. The company owns only `bytesizedco.com`; `bytesized.co` is someone else's domain and must not appear anywhere.
- `app/attribution.js` — captures UTMs + referrer first-touch into `sessionStorage` (key `bsc-attr`) and exposes `track()` for Plausible events (`waitlist_submit`, `preorder_intent`). Both forms send `attribution` with the request; the routes sanitise it and forward it as Beehiiv `utm_*` params.
- `app/api/waitlist/route.js` — `POST {email, interests?, source?, attribution?, website?}` subscribes to Beehiiv and writes the own-copy row to Supabase. `number` is `null` by design (Beehiiv has no per-subscriber position; never render a personal "#N"). `GET` returns the live `active_subscriptions` count; `BASE` is `0`, so the counter stays hidden until there is a real subscriber. **No Beehiiv keys → falls back to `data/waitlist.json`** so the form works in dev. In production that fallback cannot persist anything (read-only FS): it logs and loses the signup. If `GET` reports `source: "local"` on a deployed host, the Beehiiv env vars are missing from Vercel (the 2026-10-08 outage).
- `app/api/preorder/route.js` — backs the demo checkout. Writes the reservation to Supabase, subscribes the buyer tagged `Pre-order Intent`, and emails a confirmation via Resend. Totals are **recomputed server-side** from the line items, but unit prices are still trusted from the request. That is only acceptable while checkout takes no payment; before Stripe, look prices up from `products.js` by slug + tier.
- `source` is a key (`landing` | `checkout`) mapped to a label by `sourceLabel()` in `beehiiv.js`, so a client can never write an arbitrary value into a subscriber record.
- Both routes have email validation, a honeypot (`website` field) and a per-IP rate limit (6/min). The limit is an in-memory `Map`, so it **no-ops on serverless**; move it to Upstash/Vercel KV before real traffic. Open items live in `AUDIT-FIXES.md`.
- `supabase/schema.sql` creates `waitlist_signups`, `preorders` and the `signups_by_source` view. RLS is on with no policies, so only `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`) can touch them.
- OG/share images: `app/opengraph-image.js` / `twitter-image.js` use `next/og` and **require `export const runtime = "edge"`** (static prerender fails on Windows otherwise). Satori can't parse multi-stop `radial-gradient(... at ...)` syntax — use `radial-gradient(circle at X% Y%, ...)`.

## Brand / content constraints (hard rules — these are product decisions, not preferences)

- **Dark mode only.** No theme toggle.
- **No em-dashes in public-facing copy** (reads as AI-generated). Em-dashes are fine in code/comments.
- **No clipart / emoji icons** in the UI (line-art and procedural SVG only).
- Products may be **digital**, **physical**, or **hybrid**. Hybrid is the signature format, not a requirement for every SKU.
- Collectible products use Standard / Rare / Founder tiers; Founder must look more premium than Rare.
- One-accent discipline: stick to the existing accent tokens; don't introduce new accent colors.

## Design System

Always read `../DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, product-format language, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that does not match `DESIGN.md`.

## Secrets

`.env.local` holds live Beehiiv, Supabase service-role and Resend credentials and is gitignored. Never commit it or echo its values. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS: server-only, never prefixed `NEXT_PUBLIC_`, never read from a client component.
