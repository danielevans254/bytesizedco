/* Money went back. Amount read from the payment provider, never the request.
   Sent by: not wired yet (Stripe webhook). Replies: billing@. */

import { GROUPS } from "../../config";
import { compose } from "../../components/compose";
import { amountText, firstName, isoDate } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function refundEmail({ name, orderId, amount, refundedAt = new Date() }) {
  return compose({
    subject: `Refund for order ${orderId}`,
    label: "REFUND",
    heading: "Refund issued.",
    paras: [
      `${firstName(name)}, we refunded ${amountText(amount)} to your original payment method.`,
      "Banks usually take 5 to 10 business days to show it.",
    ],
    rows: [["Order", orderId], ["Amount", amountText(amount)], ["Date", isoDate(refundedAt)]],
    after: ["Questions about a refund? Reply and it reaches billing."],
    note: NOTES.order,
    replyTo: GROUPS.billing,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, orderId: SAMPLE_ORDER.orderId, amount: 60, refundedAt: "2026-11-20" };
