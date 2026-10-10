/* The drop opened and a reservation can now be paid. Founders get this first.
   Sent by: not wired yet (needs Stripe). Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function checkoutOpenEmail({ name, drop, tier, checkoutUrl, closesAt }) {
  return compose({
    subject: `${drop} is open. Your spot is waiting.`,
    label: "OPEN",
    heading: "Your spot is waiting.",
    paras: [
      `${firstName(name)}, ${drop} is open and your reservation comes first. Complete checkout before ${closesAt} to keep it.`,
      "After that, unclaimed spots go to the waitlist.",
    ],
    rows: [["Drop", drop], ["Tier", tier], ["Window closes", closesAt]],
    cta: { href: checkoutUrl, label: "Complete checkout" },
    after: ["Changed your mind? Reply and we will release it. Nothing is charged unless you check out."],
    note: NOTES.order,
  });
}

export const preview = {
  ...SAMPLE_CUSTOMER,
  drop: SAMPLE_ORDER.drop,
  tier: "Founder",
  checkoutUrl: "https://bytesizedco.com/shop/checkout",
  closesAt: "Nov 17, 17:00 UTC",
};
