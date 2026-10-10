/* Public API for transactional email. App code imports from here only
   ("../../lib/email"), never from files inside this folder, so the internals can
   move without touching callers. Structure and conventions: README.md.

   Scope: every system email (signup confirmation, orders, billing, alerts) is
   rendered in code and sent through Resend. Beehiiv carries only the newsletter. */

export { emailOn, GROUPS } from "./config";
export { sendEmail } from "./send";
export { sendAlert } from "./alerts";
export { TEMPLATES } from "./templates";

// Named renderers, one per template. Each returns { subject, html, text, replyTo }.
export { default as waitlistWelcomeEmail } from "./templates/account/waitlist-welcome";
export { default as reservationEmail } from "./templates/orders/reservation";
export { default as checkoutOpenEmail } from "./templates/orders/checkout-open";
export { default as inProductionEmail } from "./templates/orders/in-production";
export { default as delayEmail } from "./templates/orders/delay";
export { default as shippedEmail } from "./templates/orders/shipped";
export { default as deliveredEmail } from "./templates/orders/delivered";
export { default as companionReadyEmail } from "./templates/orders/companion-ready";
export { default as reservationReleasedEmail } from "./templates/orders/reservation-released";
export { default as receiptEmail } from "./templates/billing/receipt";
export { default as paymentFailedEmail } from "./templates/billing/payment-failed";
export { default as refundEmail } from "./templates/billing/refund";
export { default as alertEmail } from "./templates/ops/alert";
