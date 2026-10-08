# Email and own-the-list setup

Domain: **bytesized.co**. DNS is hosted on **AWS Route 53** (nameservers
`ns-798.awsdns-35.net` and three siblings), so every record below goes in the
Route 53 hosted zone for `bytesized.co`.

Four independent pieces. Each stays completely dormant until its environment
variables are set, so you can turn them on one at a time.

---

## 0. The sending split

| Purpose | Host | Status as of setup |
|---|---|---|
| Receiving mail (your inbox) | `bytesized.co` | **no MX, nothing can reach you** |
| Beehiiv newsletter | `mail.bytesized.co` | not configured |
| Resend transactional | `send.bytesized.co` | not configured |

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

`bytesized.co` currently has **zero MX records**. Sending is only half of it. If
`hello@bytesized.co` cannot receive, then every reply to a newsletter issue, every
customer question, and every supplier response goes nowhere.

Do this before anything else. Options, cheapest first:

| Option | Cost | Notes |
|---|---|---|
| **ImprovMX / Forward Email** | free tier | Forwards `hello@bytesized.co` to your personal Gmail. Fastest path. Forwarding only, so replies come *from* your personal address unless you also configure SMTP send-as. |
| **Zoho Mail** | free for 1 user | A real mailbox on your domain. Genuine inbox, dated UI. |
| **Google Workspace** | about $6/user/mo | A real mailbox, send-as works properly, and you already know the interface. |

Whichever you pick, it gives you MX records for the **root** `bytesized.co`. Add
them in Route 53, then confirm:

```bash
node scripts/check-email-dns.mjs
```

Aim for at least `hello@bytesized.co`. Add `dmarc@bytesized.co` too, since the
DMARC record below points reports there.

---

## 2. DMARC at the root

Standard record, safe to use exactly as written. Add to the `bytesized.co` hosted
zone:

```
Name:  _dmarc.bytesized.co
Type:  TXT
TTL:   300
Value: "v=DMARC1; p=none; rua=mailto:dmarc@bytesized.co"
```

Leave it at `p=none` for a few weeks and actually read the aggregate reports
before tightening to `p=quarantine`. Jumping straight to a strict policy is how
people silently blackhole their own mail.

`p=none` with no `rua=` teaches you nothing, so make sure `dmarc@bytesized.co`
resolves to an inbox from step 1.

---

## 3. Beehiiv: send the newsletter from your domain

No code changes. Dashboard plus DNS.

1. In Beehiiv, open your publication settings and find the custom sending domain
   section. Add `mail.bytesized.co`.
2. Beehiiv generates DNS records specific to your publication: typically a DKIM
   record, an SPF record, and a return-path CNAME. **Copy them from your
   dashboard, not from any guide including this one.** DKIM keys are unique per
   publication.
3. Add them to the Route 53 hosted zone.
4. Hit verify in Beehiiv.
5. Set the from-name and from-address to something a human would reply to. Point
   replies at `hello@bytesized.co`.

---

## 4. Resend: transactional email from your domain

This sends the pre-order reservation confirmation. Beehiiv still owns the
newsletter and the waitlist welcome, so nothing here duplicates it.

1. Create a Resend account and add the domain `send.bytesized.co`.
2. Resend shows MX, SPF and DKIM records. Add them in Route 53. Verify.
3. Create an API key.
4. Set:

```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Byte Sized Co. <hello@send.bytesized.co>
EMAIL_REPLY_TO=hello@bytesized.co
COMPANY_POSTAL_ADDRESS=Byte Sized Co., 1 Example St, City, ST 00000
```

`EMAIL_FROM` must use the verified `send.` subdomain or Resend rejects the send.
`EMAIL_REPLY_TO` uses the **root** domain so replies land in the inbox from step 1.

`COMPANY_POSTAL_ADDRESS` is optional but recommended. A transactional message is
exempt from CAN-SPAM's unsubscribe requirement, but a real postal address is the
safe default and you need one on file once the LLC exists.

Templates live in `app/lib/email.js`. Brand rules apply to that copy exactly as
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
| Landing waitlist signup | welcome email | nothing | `waitlist_signups` |
| Demo checkout reservation | subscribe, tagged `Pre-order Intent` | reservation confirmation | `preorders` + `waitlist_signups` |

The split is deliberate. Nothing fires twice for one action.

---

## Order to do this in

1. Inbox on the root domain, so you can receive at all.
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
