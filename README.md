# Byte Sized Co. — Landing

Next.js 14 (App Router) pre-launch / waitlist landing page.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build, run before considering work done
npm run check:dns  # verify email DNS for bytesizedco.com
```

Domain: **bytesizedco.com** (DNS on Vercel nameservers ns1/ns2.vercel-dns.com). Email setup, including the
`mail.` / `send.` sending split, is in **[EMAIL-SETUP.md](./EMAIL-SETUP.md)**.

## Waitlist → Beehiiv

The waitlist form posts to `app/api/waitlist/route.js`.

1. In beehiiv: **Settings → Integrations → API** → create a **V2 API key** and copy your **Publication ID** (`pub_…`).
2. Put them in `.env.local`:
   ```
   BEEHIIV_API_KEY=your_key
   BEEHIIV_PUBLICATION_ID=pub_xxxxxxxx
   ```
3. **Restart** `npm run dev` (env vars load at startup).

New signups are created as beehiiv subscriptions (with a welcome email). The
live counter on the page reads beehiiv's `active_subscriptions` stat. `BASE` in
the route is `0`, so the counter shows only real subscribers and stays hidden
until there is at least one.

**No keys?** It falls back to a local JSON store at `data/waitlist.json` so the
form still works in dev.

## Optional environment variables

All optional. Each feature stays off until its variable is set, so dev and
preview builds don't pollute production analytics or emit production URLs.

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots and JSON-LD. Defaults to `https://bytesizedco.com`. |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | Plausible script URL from your site settings (e.g. `https://plausible.io/js/pa-XXXXX.js`). Nothing loads without it. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Only needed for the older `data-domain` script variant. |
| `NEXT_PUBLIC_DROP_DEADLINE` | ISO 8601 drop deadline. The countdown strip and its nav link render only when this is set and still in the future. |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM` / `_TIKTOK` / `_X` | Footer social links. A link is rendered only when its URL is set, so no dead links ship. |
| `BEEHIIV_COHORT` | Cohort custom field value. Default `Founding Member`. |
| `BEEHIIV_WELCOME_EMAIL` | `false` disables beehiiv's welcome email. |
| `BEEHIIV_DOUBLE_OPT` | `on` / `off` / `not_set`. Default `off`. |
| `RESEND_API_KEY` + `EMAIL_FROM` | Transactional email from your own domain. Both required or nothing sends. |
| `EMAIL_REPLY_TO` | Where replies to transactional mail should land. |
| `COMPANY_POSTAL_ADDRESS` | Appended to transactional email footers (CAN-SPAM). |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Your own copy of every signup. Both required or persistence is skipped. |

Full walkthrough including DNS records: **[EMAIL-SETUP.md](./EMAIL-SETUP.md)**.

> `SUPABASE_SERVICE_ROLE_KEY` bypasses row level security. It is server-only.
> Never prefix it with `NEXT_PUBLIC_` and never touch it from a client component.

## Endpoints

- `POST /api/waitlist` `{ email, interests?, source?, attribution?, website? }` → `{ ok, number, total }`
- `GET  /api/waitlist` → `{ total, count, source }`
- `POST /api/preorder` `{ name, email, address?, items[], attribution?, website? }` → `{ ok, alreadyJoined, emailed, total }`

`/api/preorder` backs the demo checkout. It writes the reservation to Supabase,
subscribes the buyer to beehiiv tagged `Pre-order Intent`, and sends a
confirmation via Resend. Totals are **recomputed server-side** from the line
items rather than trusted from the request.

Server helpers live in `app/lib/`: `beehiiv.js` (list), `store.js` (own copy),
`email.js` (Resend + templates), `ratelimit.js`. Each is env-gated and
best-effort, so an outage in any one of them costs a row, never a signup.

Includes: email validation, honeypot (`website` field), and a per-IP rate
limit (6/min).

`source` is a key, not a label: `landing` (default) or `checkout`. The route maps
it to the beehiiv `Source` custom field, so the client can never write an
arbitrary value into a subscriber record.

`attribution` carries the UTMs captured on the visitor's landing page
(`app/attribution.js` stores them in `sessionStorage` on first touch). The route
sanitises them and forwards them as beehiiv's native `utm_*` params, so
subscribers are attributable to the channel that actually produced them. Without
it every subscriber would look identical.

## Analytics events

Fired through `track()` in `app/attribution.js`; no-ops unless Plausible is configured.

- `waitlist_submit` — props: `source`, `returning`. This is the Gate 1 conversion.
- `preorder_intent` — props: `items`, `value`. Fired from the demo checkout.

## Deploy (Vercel)

```bash
vercel
```

Set `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` in the Vercel project's
Environment Variables, plus any of the optional variables above you want live
(`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_PLAUSIBLE_SRC` at minimum). With beehiiv
configured there's **no filesystem dependency**, so it runs cleanly on
serverless. (The local-file fallback only matters when keys are absent — don't
rely on it in production.)

**Known gap:** the per-IP rate limit in `app/api/waitlist/route.js` is an
in-memory `Map`, so it silently no-ops on serverless (every invocation is a fresh
process). Move it to Upstash/Vercel KV before the waitlist sees real traffic.
