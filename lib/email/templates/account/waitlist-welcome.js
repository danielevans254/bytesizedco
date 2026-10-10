/* Waitlist signup confirmation.
   Sent by: app/api/waitlist/route.js, once per new subscriber, right after
   Beehiiv accepts the address. Beehiiv's own welcome email stays off
   (BEEHIIV_WELCOME_EMAIL) so nobody gets two. Replies: support@. */

import { compose } from "../../components/compose";
import { NOTES } from "../notes";

export default function waitlistWelcomeEmail() {
  return compose({
    subject: "You're on the list",
    label: "ON THE LIST",
    heading: "You're in.",
    paras: [
      "Thanks for joining the Byte Sized Co. list. Every drop is numbered and capped, and the list hears about each one before anyone else.",
      "There is nothing to do right now. Newsletter issues and product news arrive separately; this message only confirms your spot.",
    ],
    after: ["Questions? Reply to this email and a person answers."],
    note: NOTES.signup,
  });
}

export const preview = {};
