/* Left the building. The numbered card ships in the box.
   Sent by: not wired yet. Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function shippedEmail({ name, drop, orderId, edition, carrier, trackingNumber, trackingUrl }) {
  return compose({
    subject: `${drop} shipped`,
    label: "SHIPPED",
    heading: "It's on the way.",
    paras: [`${firstName(name)}, your order left today.`],
    rows: [["Order", orderId], ["Edition", edition], ["Carrier", carrier], ["Tracking", trackingNumber]],
    cta: { href: trackingUrl, label: "Track package" },
    after: ["Your numbered card is in the box. Keep it: it is the key to your digital companion."],
    note: NOTES.order,
  });
}

export const preview = {
  ...SAMPLE_CUSTOMER,
  ...SAMPLE_ORDER,
  carrier: "USPS",
  trackingNumber: "9400 1000 0000 0000 0000 00",
  trackingUrl: "https://tools.usps.com",
};
