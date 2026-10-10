/* Internal ops notice to alerts@. Same frame as customer mail so it reads the
   same in the inbox, but it leads with what broke and what to do next.
   Sent by: sendAlert() in ../../alerts.js (waitlist failure paths). No reply-to. */

import { compose } from "../../components/compose";
import { NOTES } from "../notes";

const ACTION =
  "If a subscriber is listed, add them to Beehiiv by hand. Then check the Beehiiv env vars on Vercel and run npm run check:waitlist.";

export default function alertEmail({ event, detail = {} }) {
  const show = (v) => (typeof v === "string" ? v : JSON.stringify(v));
  const rows = Object.entries({ ...detail, at: new Date().toISOString() })
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => [k, show(v)]);
  return compose({
    subject: `[alert] ${event}`,
    label: "ALERT",
    heading: event,
    paras: [ACTION],
    rows,
    note: NOTES.alert,
    replyTo: null,
    internal: true,
  });
}

export const preview = {
  event: "waitlist: Beehiiv rejected a signup",
  detail: { email: "sam@example.com", source: "landing", status: 502, error: "Service unavailable" },
};
