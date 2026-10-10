/* Pure formatting helpers shared by components and templates. No HTML here
   beyond escaping. */

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function money(n) {
  return `$${Number(n || 0)}`;
}

// Accepts a number (formatted as money) or an already-formatted string, so
// preview data can pass placeholders.
export function amountText(n) {
  return typeof n === "number" ? money(n) : String(n ?? "");
}

export function firstName(name) {
  return String(name || "").trim().split(" ")[0] || "friend";
}

// YYYY-MM-DD for a Date or a date string; anything unparseable passes through.
export function isoDate(d) {
  const t = d instanceof Date ? d : new Date(d);
  return Number.isNaN(t.getTime()) ? String(d) : t.toISOString().slice(0, 10);
}
