/* Reservation confirmation for the pre-order form.
   Sent by: app/api/preorder/route.js. Replies: support@.

   Deliberately does NOT say "order confirmed" or imply money changed hands: the
   checkout takes no payment today, and the email must not claim otherwise. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ITEMS } from "../fixtures";

export default function reservationEmail({ name, items = [], total }) {
  return compose({
    subject: "Your Drop 001 reservation",
    label: "RESERVED",
    heading: "Your spot is held.",
    paras: [`Thanks, ${firstName(name)}. Nothing has been charged. This is a reservation for Drop 001, and we will email you before anything ships.`],
    items,
    totalLabel: "Reserved total",
    total,
    after: ["Each release clearly states whether it is digital, physical, or paired. Questions about your reservation? Reply to this email and it reaches a person."],
    note: NOTES.reservation,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, items: SAMPLE_ITEMS, total: 60 };
