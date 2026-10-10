# Transactional email

Every system email (signup confirmation, orders, billing, ops alerts) is
rendered here in code and sent through Resend. Resend holds no templates. Beehiiv
carries only the newsletter; its templates are documented in
`../../docs/BEEHIIV-TEMPLATES.md`.

## Layout

```
email/
  index.js          public API; app code imports only from here
  config.js         env vars, sender, reply-to groups, emailOn
  send.js           Resend transport (sendEmail), never throws
  alerts.js         sendAlert(event, detail) to alerts@
  theme.js          hex mirrors of design-system/tokens.css, font stacks
  format.js         escapeHtml, money, firstName, isoDate
  components/       layout, no copy
    compose.js      spec -> { subject, html, text, replyTo }
    shell.js        card frame, kicker, heading, footer
    footer.js       generated footer (site.js + env), HTML and text
    blocks.js       paragraph, button, rowTable, itemTable
  templates/        copy, one email per file
    index.js        registry: the one list of every template
    notes.js        "why you are receiving this" lines
    fixtures.js     shared preview data, never sent
    account/        signup and account mail
    orders/         reservation, drop and fulfilment milestones
    billing/        receipts, payment problems, refunds
    ops/            internal alerts
```

Dependencies point one way: `templates` -> `components` -> `theme`, `format`,
`config`. Components never import templates; templates never write raw HTML.

## Add a template

1. Create `templates/<domain>/<name>.js`. Default-export a function that takes
   props and returns `compose({...})`. Export `preview` props for the dev preview.
   Put a header comment saying who sends it and which group gets replies.
2. Register it in `templates/index.js` under `"<domain>/<name>"`.
3. Export a named renderer from `index.js`.
4. Check it at `http://localhost:3000/dev/emails` (`npm run dev`), including the
   text part (`?format=text`). Run `npm run build`.

New domain (for example the drop-seller toolkit)? Add a folder under
`templates/`. Do not fork `components/`.

## Rules

- Copy follows `bytesizeco/33-brand-voice-guide.md`: no em-dashes, no emoji, no
  crypto words near the numbered card.
- Colours come from `theme.js` only. Changing a token in `tokens.css` means
  changing `theme.js` and the Beehiiv templates in the same commit.
- Company name, tagline, social links and postal address live in `lib/site.js`
  and env vars, shared with the site footer. Never type them into a template.
- One button (`cta`) per email.
- Billing amounts come from the payment provider, never from a request body.
