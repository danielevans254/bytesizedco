# Email and own-the-list setup

Domain: **bytesizedco.com**. It is the only domain the company owns (bytesized.co
belongs to someone else). DNS is hosted on **Vercel DNS** (nameservers
`ns1.vercel-dns.com` and `ns2.vercel-dns.com`), so every record below goes in the
Vercel dashboard under Domains, bytesizedco.com, DNS Records.

Four independent pieces. Each stays completely dormant until its environment
variables are set, so you can turn them on one at a time.

---

## 0. The sending split

| Purpose | Host | Status as of setup |
|---|---|---|
| Receiving mail (your inbox) | `bytesizedco.com` | **Google Workspace, MX not yet in DNS** |
| Beehiiv newsletter | `mail.bytesizedco.com` | not configured |
| Resend transactional | `bytesizedco.com` (return path on `send.`) | live: DKIM at root, MX and SPF on `send.` |

Bulk sending reputation is scoped to the sending domain. If the newsletter ever
collects spam complaints, that damage stays on `mail.` and never touches your
ability to email a supplier. Separating transactional from marketing matters too:
a reservation confirmation must land even on a day the newsletter is having
deliverability trouble.

### Check your work

After each DNS change:

```bash
node scripts/check-email-dns.mjs
```

It queries public resolvers rather than your local cache, reports SPF, MX and
DMARC for both subdomains, and exits non-zero if anything is missing. Re-run after
a change: propagation takes minutes to hours, so one failure straight after
editing DNS means nothing.

It does not check DKIM. Selectors are generated per provider and per publication,
so there is no name to look up without your dashboard open. Verify DKIM in the
Beehiiv and Resend UIs.

---

## 1. First: an inbox you can actually receive at

The inbox is **Google Workspace** (Business Starter, Flexible plan). Primary domain
`bytesizedco.com`, one paid user `daniel.evans@bytesizedco.com`, 2-Step Verification
enforced. Every other address is a free Google Group that delivers to that inbox:

| Group | Aliases | Purpose |
|---|---|---|
| `hello@` | hi@, info@, contact@, team@ | Public front door. Newsletter reply-to. Collaborative Inbox. |
| `support@` | help@, orders@ | Customer service. Reply-to for transactional mail. Collaborative Inbox. |
| `billing@` | receipts@ | Vendor receipts and invoices. |
| `alerts@` | ops@ | Deploy, payment, uptime and security alerts. |
| `dmarc@` | | DMARC aggregate reports (the `rua=` target below). |
| `abuse@`, `postmaster@` | | Reserved by Google. Exist as groups so copies reach you. |

Every group accepts mail from outside the organization, shows conversations to
members only, and posts suspicious mail instead of holding it in a moderation queue.

Until the MX record below exists, none of these addresses can receive anything:

```
Name:  bytesizedco.com   (root, "@" in Vercel)
Type:  MX
Value: smtp.google.com
Priority: 1
```

Root SPF, Google only. Beehiiv and Resend live on subdomains and must not be added here:

```
Name:  bytesizedco.com
Type:  TXT
Value: v=spf1 include:_spf.google.com ~all
```

DKIM: Admin console, Apps, Google Workspace, Gmail, Authenticate email. Copy the
`google._domainkey` TXT value shown there into Vercel DNS, wait for it to resolve,
then press **Start authentication**.

Then confirm:

```bash
node scripts/check-email-dns.mjs
```

---

## 2. DMARC at the root

Standard record, safe to use exactly as written. Add in Vercel DNS:

```
Name:  _dmarc.bytesizedco.com
Type:  TXT
TTL:   300
Value: "v=DMARC1; p=none; rua=mailto:dmarc@bytesizedco.com"
```

Leave it at `p=none` for a few weeks and actually read the aggregate reports
before tightening to `p=quarantine`. Jumping straight to a strict policy is how
people silently blackhole their own mail.

`p=none` with no `rua=` teaches you nothing. `dmarc@bytesizedco.com` is a Google Group
from step 1, so the reports land in your inbox.

---

## 3. Beehiiv: send the newsletter from your domain

No code changes. Dashboard plus DNS.

1. In Beehiiv, open your publication settings and find the custom sending domain
   section. Add `mail.bytesizedco.com`.
2. Beehiiv generates DNS records specific to your publication: typically a DKIM
   record, an SPF record, and a return-path CNAME. **Copy them from your
   dashboard, not from any guide including this one.** DKIM keys are unique per
   publication.
3. Add them in Vercel DNS.
4. Hit verify in Beehiiv.
5. Set the from-name and from-address to something a human would reply to. Point
   replies at `hello@bytesizedco.com`.

---

## 4. Resend: transactional email from your domain

This sends the pre-order reservation confirmation. Beehiiv still owns the
newsletter and the product-catalog verticals; every system email, starting with the
signup confirmation, comes from Resend.

1. In Resend, the domain is the root `bytesizedco.com` (added 2026-08-19, region
   ap-northeast-1). Resend puts its bounce MX and SPF on the `send.` subdomain and
   its DKIM key at `resend._domainkey` on the root.
2. Resend shows three records: an MX and an SPF TXT on `send`, and a DKIM TXT at
   `resend._domainkey`. Add them in Vercel DNS and press Verify.
3. Create an API key.
4. Set:

```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Byte Sized Co. <hello@bytesizedco.com>
EMAIL_REPLY_TO=support@bytesizedco.com
COMPANY_POSTAL_ADDRESS=Byte Sized Co., 1 Example St, City, ST 00000
```

`EMAIL_FROM` must be an address on the verified domain (`@bytesizedco.com`), or
Resend rejects the send. Do not use `@send.bytesizedco.com`: that subdomain only
carries the bounce records.
`EMAIL_REPLY_TO` uses the **root** domain so replies land in the `support@` group from
step 1, since every reply to a reservation email is a support question.

`COMPANY_POSTAL_ADDRESS` is optional but recommended. A transactional message is
exempt from CAN-SPAM's unsubscribe requirement, but a real postal address is the
safe default and you need one on file once the LLC exists.

Templates live in `app/lib/email.js` (Resend) and `BEEHIIV-TEMPLATES.md` (Beehiiv,
pasted into its editor). Brand rules apply to that copy exactly as
they do on the site: no em-dashes, no emoji, dark palette, one accent.

---

## 5. Supabase: own the list

Right now the only durable copy of a subscriber lives on Beehiiv's servers. This
writes a second copy you own.

1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`. It creates `waitlist_signups`,
   `preorders`, and a `signups_by_source` view.
3. From Project Settings, API, copy the project URL and the **service role** key.
4. Set:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **The service role key bypasses row level security.** It is server-only. Never
> prefix it with `NEXT_PUBLIC_`, never reference it from a client component, never
> commit it. The schema enables RLS with no policies, so the anon key can read
> nothing even if it leaks.

### Checking it works

```sql
select * from waitlist_signups order by created_at desc limit 10;
select * from signups_by_source;
```

`signups_by_source` is the Gate 1 view: which channels actually produce
subscribers. If everything reads `direct`, your UTM tagging is not reaching the
links you are posting.

---

## What sends what

| Action | Beehiiv | Resend | Supabase |
|---|---|---|---|
| Landing waitlist signup | subscribe only, no welcome email | signup confirmation | `waitlist_signups` |
| Demo checkout reservation | subscribe, tagged `Pre-order Intent` | reservation confirmation | `preorders` + `waitlist_signups` |
| Waitlist signup lost (Beehiiv 5xx or nothing stored) | nothing | alert to `alerts@` | whatever it caught |
| Paid order (after Stripe) | nothing | receipt, reply-to `billing@` | `preorders` |

The split is deliberate. Nothing fires twice for one action.

---

## Order to do this in

1. MX, SPF and DKIM for the root domain in Vercel DNS, so the Workspace inbox can receive.
2. DMARC at `p=none`.
3. Beehiiv sending domain, because the newsletter is the actual business right now.
4. Supabase, so you stop being a single provider away from losing the list.
5. Resend, last. It only matters once someone reaches the checkout.

---

## Not built yet

The reservation email is the only transactional message that exists. When real
payments go in, these follow, and they are not optional:

- Order confirmation with an **explicit ship window**. The FTC Mail Order Rule
  defaults to 30 days when no date is stated, and penalties run over $50,000 per
  violation.
- A **pre-written delay notice**, ready before you need it.
- Ship notification with tracking, plus the digital companion unlock.
