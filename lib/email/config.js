/* Environment and addressing for transactional mail. The only file that reads
   email env vars; everything else imports from here. */

import { SITE_HOST } from "@/lib/site";

/* Google Groups on the root domain. Mail is sent from EMAIL_FROM on the
   Resend-verified root domain, but replies go to a group a human reads, so each
   template picks the group that owns its replies. A preview deploy with a
   different host should set EMAIL_REPLY_TO. */
const MAIL_DOMAIN = SITE_HOST.replace(/^www\./, "");

export const GROUPS = {
  support: `support@${MAIL_DOMAIN}`, // reservations, orders, anything a customer replies to
  billing: `billing@${MAIL_DOMAIN}`, // receipts and charges
  alerts: `alerts@${MAIL_DOMAIN}`, // internal ops notices, never customer-facing
};

export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM; // e.g. "Byte Sized Co. <hello@bytesizedco.com>"
export const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO || GROUPS.support;

// Rendered in every footer. CAN-SPAM exempts transactional mail from the
// unsubscribe rule, but a real postal address is still the safe default.
export const POSTAL_ADDRESS = process.env.COMPANY_POSTAL_ADDRESS || "";

export const emailOn = Boolean(RESEND_API_KEY && EMAIL_FROM);
