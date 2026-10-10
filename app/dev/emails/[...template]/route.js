/* Dev-only preview of one email: /dev/emails/<domain>/<name>, or
   ?format=text for the plain-text part. 404 in production. */

import { TEMPLATES } from "@/lib/email";

export const dynamic = "force-dynamic";

export function GET(req, { params }) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const mod = TEMPLATES[params.template.join("/")];
  if (!mod) return new Response("No such template", { status: 404 });
  const { html, text } = mod.default(mod.preview || {});
  const asText = new URL(req.url).searchParams.get("format") === "text";
  return asText
    ? new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
    : new Response(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#08090B">${html}</body>`, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
}
