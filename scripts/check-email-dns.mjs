#!/usr/bin/env node
/* Verify the sending-domain DNS for Byte Sized Co.
 *
 *   node scripts/check-email-dns.mjs            # defaults to bytesizedco.com
 *   node scripts/check-email-dns.mjs other.co
 *
 * Checks the subdomain split described in EMAIL-SETUP.md:
 *   <domain>         Google Workspace inbox (MX, SPF, DKIM at google._domainkey)
 *   mail.<domain>  Beehiiv newsletter
 *   send.<domain>  Resend transactional
 *   _dmarc.<domain>  DMARC policy at the root
 *
 * No dependencies: Node's built-in resolver only. Read-only, safe to re-run.
 *
 * Beehiiv and Resend DKIM is not checked. Their selectors are generated per
 * publication, so there is no name to look up without your dashboard in front of
 * you. Google Workspace DKIM uses the fixed selector google._domainkey, so that
 * one is checked.
 */

import { Resolver } from "node:dns/promises";

const resolver = new Resolver();
// Public resolver, so results reflect the wider internet rather than a stale
// local cache. Propagation lag is the usual reason a record "isn't there yet".
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

const DEFAULT_DOMAIN = "bytesizedco.com";
const domain = (process.argv[2] || DEFAULT_DOMAIN)
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "");

const PASS = "  ok  ";
const WARN = " warn ";
const FAIL = " fail ";

let failures = 0;
let warnings = 0;

function line(state, label, detail) {
  if (state === FAIL) failures++;
  if (state === WARN) warnings++;
  console.log(`[${state}] ${label}${detail ? `\n         ${detail}` : ""}`);
}

async function txt(name) {
  try {
    return (await resolver.resolveTxt(name)).map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
}

async function mx(name) {
  try {
    return await resolver.resolveMx(name);
  } catch {
    return [];
  }
}

async function checkOwnership() {
  console.log(`\n== ${domain}\n`);
  try {
    const ns = await resolver.resolveNs(domain);
    line(PASS, `domain resolves, ${ns.length} nameserver(s)`, ns.join(", "));
  } catch {
    line(FAIL, "domain does not resolve", "Check the domain is registered and its nameservers are set.");
  }

  // Sending is only half of it. With no MX on the root, every reply to a
  // newsletter issue and every customer question bounces.
  const inbox = await mx(domain);
  if (inbox.length) {
    line(PASS, `root domain can receive mail, ${inbox.length} MX`, inbox.map((m) => `${m.exchange} (pref ${m.priority})`).join(", "));
  } else {
    line(FAIL, "root domain has no MX: you cannot receive email", `Nothing can reach hello@${domain}. Set up an inbox first (see EMAIL-SETUP.md step 1).`);
  }
}

async function checkRootSender() {
  console.log(`
-- Google Workspace: ${domain}`);
  const records = await txt(domain);
  const spf = records.find((r) => r.toLowerCase().startsWith("v=spf1"));
  if (spf && /include:_spf.google.com/.test(spf)) {
    line(PASS, "root SPF authorises Google", spf);
  } else if (spf) {
    line(WARN, "root SPF present but does not include Google", spf);
  } else {
    line(FAIL, "root SPF missing", 'Add TXT: "v=spf1 include:_spf.google.com ~all"');
  }
  const dkim = await txt(`google._domainkey.${domain}`);
  if (dkim.some((r) => r.toLowerCase().startsWith("v=dkim1"))) {
    line(PASS, "Google DKIM record present (google._domainkey)");
  } else {
    line(FAIL, "Google DKIM record missing", "Admin console, Gmail, Authenticate email: copy the google._domainkey TXT value into DNS.");
  }
}

async function checkDmarc() {
  const records = await txt(`_dmarc.${domain}`);
  const dmarc = records.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
  if (!dmarc) {
    line(FAIL, `_dmarc.${domain} missing`, 'Add TXT: "v=DMARC1; p=none; rua=mailto:dmarc@' + domain + '"');
    return;
  }
  const policy = /p=([a-z]+)/i.exec(dmarc)?.[1]?.toLowerCase();
  if (policy === "none") {
    line(PASS, `DMARC present, policy p=none`, "Monitor mode. Read the reports for a few weeks, then tighten to p=quarantine.");
  } else if (policy) {
    line(PASS, `DMARC present, policy p=${policy}`, dmarc);
  } else {
    line(WARN, "DMARC present but no p= tag", dmarc);
  }
  if (!/rua=/i.test(dmarc)) {
    line(WARN, "DMARC has no rua= address", "Without it you receive no aggregate reports, so p=none teaches you nothing.");
  }
}

async function checkSender(label, host, { expectMx }) {
  console.log(`\n-- ${label}: ${host}`);

  const records = await txt(host);
  const spf = records.find((r) => r.toLowerCase().startsWith("v=spf1"));
  if (spf) {
    line(PASS, "SPF present", spf);
    if (/\+all\s*$/.test(spf)) {
      line(FAIL, "SPF ends in +all", "That authorises the entire internet to send as you. Use ~all or -all.");
    }
  } else {
    line(FAIL, "SPF missing", `Add the TXT record your provider generated for ${host}.`);
  }

  const mxRecords = await mx(host);
  if (mxRecords.length) {
    line(PASS, `${mxRecords.length} MX record(s)`, mxRecords.map((m) => `${m.exchange} (pref ${m.priority})`).join(", "));
  } else if (expectMx) {
    line(WARN, "no MX records", "Resend wants an MX on the sending subdomain for its return path. Check its dashboard.");
  } else {
    line(PASS, "no MX records", "Expected: this subdomain only sends.");
  }
}

await checkOwnership();
await checkRootSender();
await checkDmarc();
await checkSender("Beehiiv newsletter", `mail.${domain}`, { expectMx: false });
await checkSender("Resend transactional", `send.${domain}`, { expectMx: true });

console.log(
  `\n${failures} failing, ${warnings} warning(s).` +
    (failures ? "\nDNS changes can take minutes to hours to propagate. Re-run before assuming something is wrong.\n" : "\n")
);
process.exit(failures ? 1 : 0);
