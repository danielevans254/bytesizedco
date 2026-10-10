/* Ops notice to the alerts@ group. Never throws and never blocks the caller's
   answer on its own failure: an alert that cannot send is logged and dropped. */

import { GROUPS } from "./config";
import { sendEmail } from "./send";
import alertEmail from "./templates/ops/alert";

export async function sendAlert(event, detail = {}) {
  const { subject, html, text } = alertEmail({ event, detail });
  const sent = await sendEmail({ to: GROUPS.alerts, subject, html, text, replyTo: null });
  if (!sent.ok && !sent.skipped) console.error("[alert] could not send:", sent.error);
  return sent;
}
