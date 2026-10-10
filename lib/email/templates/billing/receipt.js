/* Payment receipt. Replies: billing@.
   Sent by: not wired yet. Call it from the Stripe webhook only, with amounts read
   from the Stripe event, never from a request body (see the preorder price note
   in CLAUDE.md). */

import { GROUPS } from "../../config";
import { compose } from "../../components/compose";
import { firstName, isoDate } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER, SAMPLE_ITEMS } from "../fixtures";

export default function receiptEmail({ name, items = [], total, orderId, paidAt = new Date() }) {
  return compose({
    subject: `Receipt for order ${orderId || ""}`.trim(),
    label: "RECEIPT",
    heading: "Payment received.",
    paras: [`Thanks, ${firstName(name)}. This is your receipt.`],
    rows: [["Order", orderId || ""], ["Paid", isoDate(paidAt)]],
    items,
    totalLabel: "Total paid",
    total,
    after: ["We will email again when it ships. Questions about a charge? Reply here and it reaches billing."],
    note: NOTES.receipt,
    replyTo: GROUPS.billing,
  });
}

export const preview = { ...SAMPLE_CUSTOMER, orderId: SAMPLE_ORDER.orderId, items: SAMPLE_ITEMS, total: 60, paidAt: "2026-11-15T17:00:00Z" };
