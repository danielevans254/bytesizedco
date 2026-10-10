/* A reservation could not be filled (sold out) or its window lapsed.
   Sent by: not wired yet. Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function reservationReleasedEmail({ name, drop, reason }) {
  const why = reason || `${drop} sold out before your reservation could be filled, so we released it.`;
  return compose({
    subject: `${drop}: your reservation was released`,
    label: "GONE",
    heading: "Gone. The next byte is loading.",
    paras: [`${firstName(name)}, ${why}`, "Nothing was charged."],
    after: ["You stay on the list, and you hear about the next drop before it opens."],
    note: NOTES.order,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, drop: SAMPLE_ORDER.drop };
