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
live counter on the page reads beehiiv's `active_subscriptions` stat (plus a
1,204 social-proof seed — change `BASE` in the route to adjust).

**No keys?** It falls back to a local JSON store at `data/waitlist.json` so the
form still works in dev.

## Endpoints

- `POST /api/waitlist` `{ email }` → `{ ok, number, total }`
- `GET  /api/waitlist` → `{ total, count, source }`

Includes: email validation, honeypot (`website` field), and a per-IP rate
limit (6/min).

## Deploy (Vercel)

```bash
vercel
```

Set `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` in the Vercel project's
Environment Variables. With beehiiv configured there's **no filesystem
dependency**, so it runs cleanly on serverless. (The local-file fallback only
matters when keys are absent — don't rely on it in production.)
