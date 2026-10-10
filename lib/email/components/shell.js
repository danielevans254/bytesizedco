/* The frame every email renders inside, so the layout cannot drift between
   templates: page background, card, mono accent kicker, heading, body, footer.
   Inline styles only, because email clients strip <style> blocks. */

import { COLORS, FONTS, RADIUS } from "../theme";
import { escapeHtml } from "../format";
import { footerHtml } from "./footer";

// `label` is the kicker text without the leading "//"; it is added here.
// `heading` and `body` are already-safe HTML.
export function shell({ label, heading, body, note, internal = false }) {
  const kicker = String(label).replace(/^\/\/\s*/, "");
  return `<div style="background:${COLORS.bg};padding:32px 0;font-family:${FONTS.sans}">
  <div style="max-width:520px;margin:0 auto;background:${COLORS.surface};border:1px solid ${COLORS.line};border-radius:${RADIUS.card};padding:32px">
    <div style="color:${COLORS.accent};font-family:${FONTS.mono};font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700">// ${escapeHtml(kicker)}</div>
    <h1 style="color:${COLORS.textHi};font-size:26px;line-height:1.25;margin:14px 0 0;font-weight:700;letter-spacing:-.01em">${heading}</h1>
    ${body}
    ${footerHtml(note, { internal })}
  </div>
</div>`;
}
