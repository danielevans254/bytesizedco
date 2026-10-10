/* The footer every email shares, built at send time from site.js and env vars,
   so the address, social links and year change everywhere at once with no
   template edits. The same values feed the site footer.

   `note` says why this particular email was sent (see templates/notes.js).
   `internal` drops the public links and copyright for ops mail. */

import { SITE_URL, SITE_HOST, COMPANY, SOCIAL_LINKS } from "@/lib/site";
import { POSTAL_ADDRESS } from "../config";
import { COLORS, FONTS } from "../theme";
import { escapeHtml } from "../format";

function footerParts() {
  return {
    year: new Date().getUTCFullYear(),
    links: [{ label: SITE_HOST, href: SITE_URL }, ...SOCIAL_LINKS.map(({ label, href }) => ({ label, href }))],
  };
}

export function footerHtml(note, { internal = false } = {}) {
  const { year, links } = footerParts();
  const small = `color:${COLORS.meta};font-size:12px;line-height:1.6`;
  const linkRow = internal
    ? ""
    : `<div style="${small};margin-top:12px;font-family:${FONTS.mono};letter-spacing:.04em">${links
        .map((l) => `<a href="${escapeHtml(l.href)}" style="color:${COLORS.meta};text-decoration:underline">${escapeHtml(l.label)}</a>`)
        .join(`<span style="color:${COLORS.line}"> &middot; </span>`)}</div>`;
  const copy = internal
    ? ""
    : `<div style="${small};margin-top:12px">&copy; ${year} ${escapeHtml(COMPANY.name)} &middot; ${escapeHtml(COMPANY.tagline)}</div>`;
  const addr = POSTAL_ADDRESS ? `<div style="${small};margin-top:12px">${escapeHtml(POSTAL_ADDRESS)}</div>` : "";
  return `<div style="border-top:1px solid ${COLORS.line};margin-top:28px;padding-top:18px">
      <div style="${small}">${escapeHtml(note)}</div>${linkRow}${copy}${addr}
    </div>`;
}

export function footerText(note, { internal = false } = {}) {
  const { year, links } = footerParts();
  return [
    "--",
    note,
    internal ? null : links.map((l) => `${l.label}: ${l.href}`).join("\n"),
    internal ? null : `(c) ${year} ${COMPANY.name} · ${COMPANY.tagline}`,
    POSTAL_ADDRESS || null,
  ]
    .filter(Boolean)
    .join("\n");
}
