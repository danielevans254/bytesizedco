/* Digital-only orders: no box, so the unlock code arrives by email.
   Sent by: not wired yet. Replies: support@. */

import { compose } from "../../components/compose";
import { firstName } from "../../format";
import { NOTES } from "../notes";
import { SAMPLE_CUSTOMER, SAMPLE_ORDER } from "../fixtures";

export default function companionReadyEmail({ name, drop, edition, unlockCode, unlockUrl }) {
  return compose({
    subject: `Your ${drop} companion`,
    label: "UNLOCKED",
    heading: "Your companion is ready.",
    paras: [`${firstName(name)}, your digital companion for ${drop} is ready. No account needed to open it.`],
    rows: [["Edition", edition], ["Code", unlockCode]],
    cta: { href: unlockUrl, label: "Open it" },
    after: ["New drops add to the same space, so keep this email."],
    note: NOTES.order,
  });
}

export const preview = {
  ...SAMPLE_CUSTOMER,
  ...SAMPLE_ORDER,
  unlockCode: "OCT-7Q2M-48KD",
  unlockUrl: "https://bytesizedco.com/unlock/octet",
};
