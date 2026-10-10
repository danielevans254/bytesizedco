/* Builds a finished message from one declarative spec. Every template goes
   through here, so the HTML and plain-text parts are rendered from the same data
   and cannot say different things.

   Spec, in render order:
     subject, label (kicker), heading
     paras     plain-text paragraphs before the data
     rows      [label, value] pairs
     items     line items, with totalLabel and total
     cta       { href, label } for the single button
     after     plain-text paragraphs after the data
     note      why this email was sent (templates/notes.js)
     replyTo   reply group, default support@; null for none
     internal  ops mail: no public links in the footer */

import { GROUPS } from "../config";
import { escapeHtml, money } from "../format";
import { shell } from "./shell";
import { footerText } from "./footer";
import { paragraph, button, rowTable, itemTable, itemLines } from "./blocks";

export function compose({
  subject,
  label,
  heading,
  paras = [],
  items = [],
  totalLabel = "Total",
  total,
  rows = [],
  cta,
  after = [],
  note,
  replyTo = GROUPS.support,
  internal = false,
}) {
  const html = shell({
    label,
    heading: escapeHtml(heading),
    note,
    internal,
    body: [
      ...paras.map((p) => paragraph(p)),
      rows.length ? rowTable(rows) : "",
      items.length ? itemTable(items, totalLabel, total) : "",
      cta ? button(cta.href, cta.label) : "",
      ...after.map((p, i) => paragraph(p, i === 0 ? 24 : 14)),
    ]
      .filter(Boolean)
      .join("\n    "),
  });

  const text = [
    label.replace(/^\/\/\s*/, "").toUpperCase(),
    heading,
    ...paras,
    rows.length ? rows.map(([k, v]) => `${k}: ${v}`).join("\n") : null,
    items.length ? [...itemLines(items), `${totalLabel}: ${money(total)}`].join("\n") : null,
    cta ? `${cta.label}: ${cta.href}` : null,
    ...after,
    footerText(note, { internal }),
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, html, text, replyTo };
}
