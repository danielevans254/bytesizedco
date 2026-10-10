/* Hex mirrors of app/design-system/tokens.css. Email clients strip CSS
   variables, so these are the one place email colours are defined. Change a token
   in tokens.css, change it here in the same commit (see the design-system skill),
   and keep the Beehiiv templates in step (docs/BEEHIIV-TEMPLATES.md). */

export const COLORS = {
  bg: "#08090B", // --bg
  surface: "#101216", // --surface: the card
  line: "#23272F", // --line: borders, dividers
  textHi: "#F4F6F9", // --text-hi: headings, values, emphasis
  text: "#B9BFC9", // --text: reading copy
  // Email-only meta grey for labels and footer. --muted (#646B77) fails 4.5:1 at
  // small sizes, so it is not used here.
  meta: "#8B929E",
  accent: "#6BFFA8", // --accent: kicker, totals, the one button
  accentInk: "#04130A", // --accent-ink: text on Byte Green
};

// Web fonts rarely load in email; these stacks fall back to system faces.
export const FONTS = {
  sans: "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace",
};

export const RADIUS = { button: "5px", card: "16px" }; // --r-sm, --r-lg
