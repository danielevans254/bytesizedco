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
npm run check:dns  # MX, SPF, DKIM, DMARC for bytesizedco.com plus mail. and send. subdomains (see docs/EMAIL-SETUP.md)
npm run check:waitlist   # read-only probe of production /api/waitlist (pass a URL to target another host)
```

Plain **JavaScript, not TypeScript**. Import alias `@/*` maps to repo root (`jsconfig.json`).
There is no test suite.

## Project structure

`app/` is the routing tree only. Everything else lives beside it, organised by feature:

```text
app/                 routes only: page.js / layout.js / route.js, metadata files (icon, OG, robots, sitemap)
  api/               waitlist and preorder route handlers (thin: validate, orchestrate, respond)
  shop/              /shop, /shop/[slug], /shop/checkout route entries
  dev/emails/        dev-only email previews (404 in production)
features/            one folder per product area; owns its components, data, state and copy
  landing/           the pre-launch page: LandingPage.js, sections/, content.js, useLandingEffects.js, waitlistForm.js
  shop/              components/, data/products.js, state/ (cart, recently viewed), config.js
components/ui/       shared presentational primitives used by more than one feature
lib/                 non-UI code: site.js (origin, company, socials), attribution.js, validation.js,
                     ratelimit.js, integrations/ (beehiiv, store = Supabase), waitlist/, email/
styles/              design-system/ (tokens.css, primitives.css) and globals.css, loaded once by app/layout.js
docs/                operational docs: EMAIL-SETUP, BEEHIIV-TEMPLATES, AUDIT-FIXES
scripts/             read-only ops checks (check:dns, check:waitlist)
supabase/            schema.sql
```

Conventions:
- **Route files stay thin.** A `page.js` re-exports or composes from `features/`; a `route.js` validates input and calls `lib/`. No business logic or long JSX in `app/`.
- **Imports:** use the `@/` alias across top-level areas (`@/lib/site`, `@/features/shop/config`); use relative paths inside one feature or module. App code imports email only from `@/lib/email`.
- **New product area** (newsletter archive, the drop-seller toolkit): add `features/<area>/` and thin route files under `app/`. Promote a component to `components/ui/` only once a second feature uses it.
- **Server-only code** (`lib/integrations/`, `lib/email/`, `lib/waitlist/`) must never be imported by a `"use client"` module.

## Architecture

### Data-driven shop engine (`features/shop/`)
The shop is **declarative**: products are data, components are generic renderers. To add or change
a product you edit data, not JSX.

- `data/products.js` — the `RAW` array is the single source of truth. Each product declares:
  - `format` — `digital`, `physical`, or `hybrid` (defaults to `hybrid`). Never hard-code the customer-facing format label in a component.
  - `tiers` — rarity editions (Standard ◆ / Rare ◆◆ / Founder ◆◆◆) via the `tiers(base)` helper; used by collectible products.
  - `options[]` — typed variant axes (`swatch`, `size`, `format`, `bundle`, `level`, `text`, `toggle`), each with optional `priceDelta`.
  - `modules[]` — content blocks (`materials`, `whatsInBox`, etc.) rendered `inline` (accordion) or in a `modal`.
- `components/ProductConfigurator.js` renders `options[]`; `components/ProductModules.js` renders `modules[]`. They switch on `type`/`display` — extend these when adding a new option/module type.
- `config.js` — shared constants + **deterministic, SSR-safe** helpers, including product-format labels and default cart items. It must never use `Date`/`Math.random` (would cause hydration mismatch); "units left" and floor price are derived from a string `hash()`.
- `components/ProductArt.js` — **procedural SVG art, no photos.** `variant` selects the department motif; `companion` renders the digital-file motif; `color` tints it. Reused on the landing page too (pure component, no `"use client"`).
- `state/cart.js` — cart state via React Context + `localStorage` (key `bsc-cart`); slide-out `components/CartDrawer.js`; demo checkout route at `app/shop/checkout/`. Cart item `id` encodes tier + chosen options so variants are distinct lines. `state/recent.js` tracks recently viewed products.

### Landing page (`features/landing/`)
- `LandingPage.js` — the `"use client"` page; `app/page.js` re-exports it. It renders one component per section from `sections/` (Hero, Manifesto, Formats, Editions, Departments, Feed, Faq, JoinWaitlist, ...).
- `content.js` — all copy and data arrays (pillars, editions, FAQ and its JSON-LD, boot lines, typewriter phrases). Edit copy here, not in JSX.
- `useLandingEffects.js` — every page-wide client behaviour (boot intro, scroll progress, cursor, card tilt, holo foil, reveal, live waitlist counter, countdown), wired to the markup by id/class and cleaned up on unmount.
- `waitlistForm.js` — the join form submit and interest chips. `drop.js` — the `NEXT_PUBLIC_DROP_DEADLINE` countdown config.
- `DESIGN.md` — the company-wide visual source of truth. Read it before visual work.
- `styles/design-system/tokens.css` — canonical colors, type, spacing, shape, elevation, and motion tokens.
- `styles/design-system/primitives.css` — reusable composition helpers and state utilities.
- `styles/globals.css` — existing landing/shop compositions. New shared foundations belong in `styles/design-system/`, not in this file.
- `components/ui/` — shared brand, section-label, and product-format primitives.

### API routes and server helpers (`app/api/`, `lib/`)
- **Three dependencies, by design.** `package.json` lists only `next`, `react`, `react-dom`. Beehiiv, Supabase (PostgREST) and Resend are called with hand-rolled `fetch` in `lib/`. Don't add an SDK for them.
- **Every helper is env-gated and best-effort.** `beehiiv.js` (`beehiivOn`), `store.js` (`storeOn`), `email/` (`emailOn`) and `ratelimit.js` skip silently when their env vars are missing and never throw. A provider outage costs a row, never a signup. The env var reference is in `README.md`; DNS and email wiring is in `docs/EMAIL-SETUP.md`.
- `lib/site.js` — exports `SITE_URL`, the one place the public origin is defined, plus `SITE_HOST`, `COMPANY` (name, tagline) and `SOCIAL_LINKS` (from `NEXT_PUBLIC_SOCIAL_*`, only the ones set). The site footer and every email footer read these, so change company facts here, not in a template. Derive display hosts and referrers from it. The company owns only `bytesizedco.com`; `bytesized.co` is someone else's domain and must not appear anywhere.
- `lib/email/` — every transactional email, built in code; Resend is only the sender. Import only from `lib/email` (its `index.js`). Layers: `config`/`send`/`theme`/`format` → `components/` (shell, generated footer, blocks, `compose`) → `templates/<domain>/<name>.js`, one email per file with its `preview` props, listed in `templates/index.js`. Preview all at `/dev/emails` in `npm run dev` (404 in production). How to add a template: `lib/email/README.md`.
- `lib/attribution.js` — captures UTMs + referrer first-touch into `sessionStorage` (key `bsc-attr`) and exposes `track()` for Plausible events (`waitlist_submit`, `preorder_intent`). Both forms send `attribution` with the request; the routes sanitise it and forward it as Beehiiv `utm_*` params.
- `app/api/waitlist/route.js` — `POST {email, interests?, source?, attribution?, website?}` subscribes to Beehiiv and writes the own-copy row to Supabase. `number` is `null` by design (Beehiiv has no per-subscriber position; never render a personal "#N"). `GET` returns the live `active_subscriptions` count; `BASE` is `0`, so the counter stays hidden until there is a real subscriber. **No Beehiiv keys → falls back to `data/waitlist.json`** (`lib/waitlist/localStore.js`) so the form works in dev. In production that fallback cannot persist anything (read-only FS): it logs and loses the signup. If `GET` reports `source: "local"` on a deployed host, the Beehiiv env vars are missing from Vercel (the 2026-10-08 outage).
- `app/api/preorder/route.js` — backs the demo checkout. Writes the reservation to Supabase, subscribes the buyer tagged `Pre-order Intent`, and emails a confirmation via Resend. Totals are **recomputed server-side** from the line items, but unit prices are still trusted from the request. That is only acceptable while checkout takes no payment; before Stripe, look prices up from `products.js` by slug + tier.
- `source` is a key (`landing` | `checkout`) mapped to a label by `sourceLabel()` in `beehiiv.js`, so a client can never write an arbitrary value into a subscriber record.
- Both routes share email validation (`lib/validation.js`), a honeypot (`website` field) and a per-IP rate limit (6/min). The limit is an in-memory `Map`, so it **no-ops on serverless**; move it to Upstash/Vercel KV before real traffic. Open items live in `docs/AUDIT-FIXES.md`.
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

Always read `../DESIGN.md` before making any visual or UI decisions, and load the workspace `design-system` skill
(`../.claude/skills/design-system/SKILL.md` + `reference.md`) for the full token table, class catalogue,
approved exceptions and known drift.
All font choices, colors, spacing, product-format language, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that does not match `DESIGN.md`.

## Secrets

`.env.local` holds live Beehiiv, Supabase service-role and Resend credentials and is gitignored. Never commit it or echo its values. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS: server-only, never prefixed `NEXT_PUBLIC_`, never read from a client component.
