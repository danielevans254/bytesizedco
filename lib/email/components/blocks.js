/* Body building blocks. Each takes plain values and escapes them itself, so a
   template never hand-writes HTML. */

import { COLORS, FONTS, RADIUS } from "../theme";
import { escapeHtml, money } from "../format";

export function paragraph(text, top = 14) {
  return `<p style="color:${COLORS.text};font-size:15px;line-height:1.65;margin:${top}px 0 0">${escapeHtml(text)}</p>`;
}

// The one accent-filled element in a message. One per email at most.
export function button(href, label) {
  return `<div style="margin-top:28px"><a href="${escapeHtml(href)}" style="display:inline-block;background:${COLORS.accent};color:${COLORS.accentInk};font-family:${FONTS.mono};font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:${RADIUS.button}">${escapeHtml(label)}</a></div>`;
}

// Label / value rows: order number, edition, tracking. Values in mono so codes
// and numbers read as data.
export function rowTable(rows) {
  return `<table style="width:100%;border-collapse:collapse;margin-top:24px">${rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 16px 10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.meta};font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.textHi};font-size:13px;font-family:${FONTS.mono};word-break:break-all">${escapeHtml(v)}</td>
      </tr>`
    )
    .join("")}</table>`;
}

// Line items with a highlighted total, for reservations and receipts.
export function itemTable(items, totalLabel, total) {
  const rows = items
    .map(
      (it) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.textHi};font-size:14px">
          ${escapeHtml(it.name)}
          <span style="color:${COLORS.meta}"> ${escapeHtml(it.tierLabel || "")}${it.variant ? ` / ${escapeHtml(it.variant)}` : ""}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.meta};font-size:14px;text-align:right;white-space:nowrap;font-family:${FONTS.mono}">
          ${it.qty || 1} x ${money(it.price)}
        </td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin-top:24px">${rows}
      <tr>
        <td style="padding:14px 0 0;color:${COLORS.textHi};font-size:15px;font-weight:700">${escapeHtml(totalLabel)}</td>
        <td style="padding:14px 0 0;color:${COLORS.accent};font-size:15px;font-weight:700;text-align:right;font-family:${FONTS.mono}">${money(total)}</td>
      </tr>
    </table>`;
}

export function itemLines(items) {
  return items.map((it) => `- ${it.name} ${it.tierLabel || ""}${it.variant ? ` / ${it.variant}` : ""} x${it.qty || 1}  ${money(it.price)}`);
}
