/* Card declined. The spot is held for a fixed window, then released.
   Sent by: not wired yet (Stripe webhook). Replies: billing@. */

import { GROUPS } from "../../config";
import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function paymentFailedEmail({ name, drop, orderId, updateUrl, holdUntil }) {
  return compose({
    subject: `Action needed: payment for order ${orderId}`,
    label: "PAYMENT",
    heading: "Your payment did not go through.",
    paras: [`${firstName(name)}, the card on order ${orderId} was declined. Your spot in ${drop} is held until ${holdUntil}.`],
    cta: { href: updateUrl, label: "Update payment" },
    after: ["After that, the spot goes back to the waitlist. Questions about a charge? Reply and it reaches billing."],
    note: NOTES.order,
    replyTo: GROUPS.billing,
  });
}

export const preview = {
  ...SAMPLE_CUSTOMER,
  ...SAMPLE_ORDER,
  updateUrl: "https://bytesizedco.com/shop/checkout",
  holdUntil: "Nov 18, 17:00 UTC",
};
