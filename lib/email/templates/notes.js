/* The "why you are receiving this" line in each footer. Kept together so the
   wording stays consistent and legal review happens in one place. */

import { SITE_HOST } from "@/lib/site";

export const NOTES = {
  signup: `You are receiving this because you joined the list on ${SITE_HOST}. This is a one-time confirmation, not the newsletter.`,
  reservation: `You are receiving this because you reserved a spot on ${SITE_HOST}. This is a transactional message about that reservation, not marketing.`,
  order: `You are receiving this because you have an order or reservation on ${SITE_HOST}. This is a transactional message, not marketing.`,
  receipt: `You are receiving this because you placed an order on ${SITE_HOST}. Keep it for your records.`,
  alert: "Sent to the alerts group by the site. Internal only, never customer-facing.",
};
