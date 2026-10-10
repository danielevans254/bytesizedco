/* Dev-only index of every transactional email: /dev/emails.
   Reads the registry in app/lib/email/templates, so nothing here needs editing
   when a template is added. 404 in production. */

import { TEMPLATES } from "@/lib/email";

export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const rows = Object.entries(TEMPLATES)
    .map(([key, mod]) => {
      const { subject, replyTo } = mod.default(mod.preview || {});
      return `<tr><td><a href="/dev/emails/${key}">${key}</a></td><td>${escape(subject)}</td><td>${escape(replyTo || "none")}</td><td><a href="/dev/emails/${key}?format=text">text</a></td></tr>`;
    })
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><title>Email previews</title>
<style>body{background:#08090B;color:#B9BFC9;font:14px/1.6 Inter,system-ui,sans-serif;padding:32px}a{color:#6BFFA8}td,th{padding:6px 16px 6px 0;text-align:left;border-bottom:1px solid #23272F}th{color:#8B929E;font-weight:500}</style>
<h1 style="color:#F4F6F9;font-size:20px">Email previews</h1>
<p>Rendered from app/lib/email/templates with each template's preview props. Footer values come from app/site.js and env vars.</p>
<table><tr><th>Template</th><th>Subject</th><th>Reply-to</th><th></th></tr>${rows}</table>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
