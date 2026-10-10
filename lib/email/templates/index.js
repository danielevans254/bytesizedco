/* Registry of every transactional email. The single list: the public API in
   ../index.js and the dev preview at /dev/emails both read it, so a template
   added here is exported and previewable with nothing else to update.

   Key: "<domain>/<name>", matching the file path. Value: the template module,
   which default-exports render(props) -> { subject, html, text, replyTo } and
   exports `preview` props for /dev/emails. */

import * as waitlistWelcome from "./account/waitlist-welcome";
import * as reservation from "./orders/reservation";
import * as checkoutOpen from "./orders/checkout-open";
import * as inProduction from "./orders/in-production";
import * as delay from "./orders/delay";
import * as shipped from "./orders/shipped";
import * as delivered from "./orders/delivered";
import * as companionReady from "./orders/companion-ready";
import * as reservationReleased from "./orders/reservation-released";
import * as receipt from "./billing/receipt";
import * as paymentFailed from "./billing/payment-failed";
import * as refund from "./billing/refund";
import * as alert from "./ops/alert";

export const TEMPLATES = {
  "account/waitlist-welcome": waitlistWelcome,
  "orders/reservation": reservation,
  "orders/checkout-open": checkoutOpen,
  "orders/in-production": inProduction,
  "orders/delay": delay,
  "orders/shipped": shipped,
  "orders/delivered": delivered,
  "orders/companion-ready": companionReady,
  "orders/reservation-released": reservationReleased,
  "billing/receipt": receipt,
  "billing/payment-failed": paymentFailed,
  "billing/refund": refund,
  "ops/alert": alert,
};
