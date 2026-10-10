/* Paid, and the drop is being made. Sets the padded ship window.
   Sent by: not wired yet (needs Stripe + fulfilment). Replies: support@.
   Milestone emails follow the "over-communicate delays" rule in the operations
   notes: tell people before a date slips, never after. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function inProductionEmail({ name, drop, orderId, eta }) {
  return compose({
    subject: `${drop} is in production`,
    label: "IN PRODUCTION",
    heading: "It's being made.",
    paras: [
      `${firstName(name)}, your order is paid and ${drop} is now in production.`,
      "We pad every date, so the window below is the honest one. If it moves, you hear from us before it does.",
    ],
    rows: [["Order", orderId], ["Drop", drop], ["Expected to ship", eta]],
    note: NOTES.order,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, ...SAMPLE_ORDER, eta: "Dec 1 to Dec 12" };
