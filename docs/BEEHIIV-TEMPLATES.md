# Beehiiv templates

Beehiiv sends everything a subscriber gets as marketing: the welcome email, the
newsletter, and drop announcements. These templates are built in Beehiiv's
editor, not in code, so this file holds the settings and copy to paste in. Keep it
in sync when you change one there.

Transactional mail (reservations, receipts, ops alerts) is Resend, in
`lib/email/`. See `EMAIL-SETUP.md`, "What sends what".

**Built in the dashboards on 2026-10-09:** Beehiiv welcome email (published, dark
styles applied), post templates "6 bytes (newsletter)" and "DROP:: announcement".
Resend is used only for sending (decided 2026-10-10). Every transactional email
is built in code in `lib/email/` (see its README); preview them all at `/dev/emails` with
`npm run dev`. Any templates left in the Resend dashboard are stale copies and are
not used.

Brand rules apply to every line below: no em-dashes, no emoji, one accent colour,
no crypto words (mint, token, wallet, blockchain). Run `/brand-lint` over any edit.

---

## Which group owns what

| Group | Role in mail | Where it is set |
|---|---|---|
| `hello@` | Reply-to for the welcome email, the newsletter and drop announcements | Beehiiv > Settings > Publication > Email |
| `support@` | Reply-to for reservation mail | `EMAIL_REPLY_TO` (Resend) |
| `billing@` | Reply-to for receipts, and the inbox for vendor invoices (Beehiiv, Resend, Vercel, Google) | `receiptEmail` (Resend); each vendor's billing settings |
| `alerts@` | Receives ops alerts when a waitlist signup fails | `sendAlert` (Resend); also Vercel and Resend notification settings |
| `noreply@` | Not used as a sender. Resend sends from `send.`, Beehiiv from `mail.`. Kept for vendor signups that need an address nobody answers | |
| `dmarc@`, `abuse@`, `postmaster@` | Receive only. DMARC reports and RFC-required mailboxes. No templates | DNS `_dmarc` record |

Never put `noreply@` as a reply-to. Every reply should reach a person.

---

## Publication settings (once)

Settings > Publication > Email:

- **From name:** `Bytesized`
- **From address:** `hello@mail.bytesizedco.com` (needs the `mail.` sending domain verified, `EMAIL-SETUP.md` step 3)
- **Reply-to:** `hello@bytesizedco.com`
- **Footer postal address:** the same value as `COMPANY_POSTAL_ADDRESS`. Beehiiv requires one before you can send.

Styles are **per template** in Beehiiv (Style panel inside each template), not
publication-wide. Applied to every Bytesized template on 2026-10-10, from
`web/styles/design-system/tokens.css` via the `design-system` skill:

| Element | Value | Where it is set |
|---|---|---|
| Canvas and post | `#08090B` (`--bg`) | Style > Template |
| Content card | `#101216` (`--surface`), 1px `#23272F` border, 16px radius, 32px padding | a `section` block wrapping the whole body |
| Kicker (`// BYTESIZED ...`) | `#6BFFA8`, mono stack, 12px, bold, uppercase | inline text style |
| Headings, bold labels | `#F4F6F9` (`--text-hi`) | inline text style |
| Body copy, list default | `#B9BFC9` (`--text`) | inline text style + Style > Paragraph |
| Meta lines (sources, disclosure, sign-off) | `#8B929E` (email muted, passes 4.5:1) | inline text style |
| Links | `#6BFFA8` | inline text style |
| Title / subtitle | `#F4F6F9` / `#B9BFC9` | Style > Email header |
| Footer | bg `#101216`, text and links `#8B929E`, border and divider `#23272F` | Style > Email footer |

Beehiiv offers Inter but not Space Grotesk or JetBrains Mono, so headings are Inter
bold and the kicker uses a system mono stack. "Powered by beehiiv" stays white on
the Free plan. Web styles (the post page on the beehiiv site) are separate and live
in Website Builder.

When you create a new post from a template, the card and colours come with it. A
template built from scratch needs the same treatment: wrap the body in a section
with the card values, then set canvas, post, header and footer in the Style panel.

Logo: use the `brand/` SVG export rasterised to PNG at 2x (email clients drop SVG).

---

## Bytesized formats (post templates)

The newsletter is the main product, under the umbrella name **Bytesized** with
verticals that share it: Bytesized News, Bytesized Home, and whatever comes next.
Templates are formats, not verticals, so a new vertical needs no new template:
swap `{VERTICAL}` in the kicker. Every issue opens with a `// BYTESIZED ...`
kicker line in code style.

| Beehiiv template | Format | Typical vertical |
|---|---|---|
| Bytesized · The Brief (news) | 5 stories, each with "Why it matters", a sponsor slot, "Also moving" | News |
| Bytesized · How-to (home and practical) | Time, cost, skill, tools, 5 steps, mistakes, "Stop and call a pro if" | Home |
| Bytesized · Deep Dive | One question, the short answer, 3 sections, takeaways, sources | Any |
| Bytesized · Tested (review) | Verdict (Buy / Wait / Skip), works / does not, affiliate disclosure | Home, gear |
| Bytesized · Weekly (all verticals) | One headline per vertical, sponsor slot, one pick, drop line | Whole brand |
| Bytesized · Mailbag (reader Q&A) | Three reader questions and answers | Any |
| Bytesized · Launch a new vertical | Announces a new vertical to existing subscribers | Brand |
| Bytesized · Quick Byte (one tip) | One tip, why it works, "Try it", time it takes | Any |
| Bytesized · Explained (5 bytes) | A topic in 5 numbered points, what happens next, what it means for you | News |
| Bytesized · Checklist (seasonal) | This weekend / this month / call a pro for | Home |
| Bytesized · Buyer's Guide (picks) | Short answer, what matters, best overall / value / upgrade, skip, disclosure | Home, gear |
| Bytesized · Project Log (before and after) | Budget and time planned vs spent, before, steps, what went wrong, after | Home |
| Bytesized · 5 Questions (interview) | Five questions with one person | Any |
| Bytesized · Month in Review | Most read, what we got wrong, coming next month | Whole brand |

The older "6 bytes (newsletter)" and "DROP:: announcement" templates predate the
`Bytesized ·` prefix; rename them in the Beehiiv UI when convenient.

Rules that hold across formats: label sponsored content as **Sponsored**, keep the
affiliate disclosure on every review, and keep the "call a pro" safety line on any
how-to that touches wiring, gas or structure.

---

## 1. Welcome email

Sent by Beehiiv on every new signup (`send_welcome_email`, on unless
`BEEHIIV_WELCOME_EMAIL=false`). It is the first thing anyone receives from us.
Rewritten 2026-10-09 for the newsletter-first Bytesized brand and published; the
Settings > Emails > Welcome email toggle must also be on for it to send.

**Sender name:** `Bytesized`
**Subject:** `You're in.`
**Preview text:** `Your world, simplified.`

> `// BYTESIZED`
>
> **You're in.**
>
> Bytesized is the useful stuff, cut down to size. Short issues on the news, your
> home, and whatever else earns a spot. Each one takes a few minutes and leaves you
> with something you can use.
>
> **What lands in your inbox**
>
> - **Bytesized News.** The stories that matter, with one line on why.
> - **Bytesized Home.** How-tos and tested picks for the place you live.
> - **Drops.** Small numbered releases. Members hear first.
>
> More lines get added when they are good enough to send. No spam, ever.
>
> Reply and tell us what you want covered. A person reads every one.
>
> [ Visit Bytesized ] → `https://bytesizedco.com`

When a new vertical launches, add a line to the list above and republish.

---

## 2. Newsletter: "6 bytes"

Save as a post template (Posts > Templates > New) so every issue starts from it.

**Subject pattern:** `6 bytes: {one strong noun from the anchor}`
**Preview text:** the anchor's first sentence.

> `// THE FEED · ISSUE {n}`
>
> **{Anchor headline}**
>
> {Editorial anchor. Three to five sentences, one point of view.}
>
> ---
>
> **6 bytes**
>
> 1. **{Pick}.** {One line on why.}
> 2. **{Pick}.** {One line on why.}
> 3. **{Pick}.** {One line on why.}
> 4. **{Pick}.** {One line on why.}
> 5. **{Pick}.** {One line on why.}
> 6. **{Pick}.** {One line on why.}
>
> ---
>
> **One link out:** {link with a single line of context}
>
> **On repeat:** {song, artist}
>
> ---
>
> `DROP::{NAME}` is loading. Founders hear first.

---

## 3. Drop announcement

Separate post template. Send to everyone, or segment `Cohort = Founding Member`
first for early access.

**Subject:** `DROP::{NAME} is loading`
**Preview text:** `{N} numbered units. Founders get first access.`

> `// DROP::{NAME}`
>
> **{N} numbered units. {one-line theme}.**
>
> {Two sentences on the object. Say whether it is digital, physical, or paired,
> using the same label the shop shows.}
>
> | Tier | Edition | Price |
> |---|---|---|
> | Standard | No. 001 to {n} | ${price} |
> | Rare | No. 001 to {n} | ${price} |
> | Founder | No. 001 to {n} | ${price} |
>
> Founders get first access on {date}. It opens to everyone on {date}.
> It sells out. We do it again.
>
> [ Reserve yours ] → `https://bytesizedco.com/shop/{slug}`

When it sells out, the follow-up subject is `Gone. The next byte is loading.`
Never "out of stock".
