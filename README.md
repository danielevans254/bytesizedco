# Byte Sized Co. — Landing

Next.js 14 (App Router) pre-launch / waitlist landing page.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots and JSON-LD. Defaults to `https://bytesized.co`. |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | Plausible script URL from your site settings (e.g. `https://plausible.io/js/pa-XXXXX.js`). Nothing loads without it. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Only needed for the older `data-domain` script variant. |
| `NEXT_PUBLIC_DROP_DEADLINE` | ISO 8601 drop deadline. The countdown strip and its nav link render only when this is set and still in the future. |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM` / `_TIKTOK` / `_X` | Footer social links. A link is rendered only when its URL is set, so no dead links ship. |
| `BEEHIIV_COHORT` | Cohort custom field value. Default `Founding Member`. |
| `BEEHIIV_WELCOME_EMAIL` | `false` disables beehiiv's welcome email. |
| `BEEHIIV_DOUBLE_OPT` | `on` / `off` / `not_set`. Default `off`. |

## Endpoints

- `POST /api/waitlist` `{ email, interests?, source?, attribution?, website? }` → `{ ok, number, total }`
- `GET  /api/waitlist` → `{ total, count, source }`

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
