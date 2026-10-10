// Fixed Drop 001 deadline so the countdown is real, not a per-load timer.
// Set NEXT_PUBLIC_DROP_DEADLINE (ISO 8601) to switch the countdown on.
// There is deliberately no fallback date: an unset or elapsed deadline hides the
// strip entirely rather than rendering 00:00:00:00. A countdown that isn't
// counting down is fake urgency, which the brand rules out.
export const DROP_DEADLINE = Date.parse(process.env.NEXT_PUBLIC_DROP_DEADLINE || "");
export const HAS_DEADLINE = Number.isFinite(DROP_DEADLINE);
