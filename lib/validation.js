/* Input validation shared by the API routes, so every form accepts and rejects
   the same addresses. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Expects an already trimmed, lower-cased address.
export function isValidEmail(email) {
  return EMAIL_RE.test(email) && email.length <= 200;
}
