/* A ship date moved. Send it as soon as the slip is known, with a way out.
   Sent by: not wired yet. Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function delayEmail({ name, drop, orderId, oldEta, newEta, reason }) {
  return compose({
    subject: `${drop}: new ship date`,
    label: "DELAY",
    heading: "A delay, stated plainly.",
    paras: [`${firstName(name)}, ${drop} will ship later than we said.`, reason, "Your order and your edition number are unchanged."],
    rows: [["Order", orderId], ["Was", oldEta], ["Now", newEta]],
    after: ["If the new date does not work for you, reply and we will refund you in full."],
    note: NOTES.order,
  });
}

export const preview = {
  ...SAMPLE_CUSTOMER,
  ...SAMPLE_ORDER,
  oldEta: "Dec 1 to Dec 12",
  newEta: "Dec 15 to Dec 22",
  reason: "The foil supplier pushed our slot by ten days.",
};
