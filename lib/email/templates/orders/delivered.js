/* Arrived. Points at the numbered card as the key to the companion.
   Sent by: not wired yet. Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function deliveredEmail({ name, drop, edition, unlockUrl }) {
  return compose({
    subject: `${drop} arrived`,
    label: "DELIVERED",
    heading: "It landed.",
    paras: [
      `${firstName(name)}, tracking says your order arrived.`,
      "Find the numbered card in the box. Tap it with your phone, or enter its code at the link below, to open your digital companion.",
    ],
    rows: [["Edition", edition]],
    cta: { href: unlockUrl, label: "Open your companion" },
    after: ["Something missing or damaged? Reply with a photo and we will make it right."],
    note: NOTES.order,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, ...SAMPLE_ORDER, unlockUrl: "https://bytesizedco.com/unlock/octet" };
