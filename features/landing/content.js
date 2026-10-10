/* Landing page copy and data. Sections render from these arrays, so editing
   copy never means touching JSX. Brand rules apply: no em-dashes, no crypto
   language near the numbered card (bytesizeco/33-brand-voice-guide.md). */

export const PILLARS = [
  ["// CARRY", "Carry & Everyday", "EDC, desk objects, the small useful things.", "Physical · Digital · Paired", ""],
  ["// WEAR", "Wear", "Apparel basics with a point of view.", "Physical · Digital · Paired", ""],
  ["// PLAY", "Play", "Card games, stickers, crafts, kits.", "Physical · Digital · Paired", ""],
  ["// READ", "Read & Feed", "Books, zines, the newsletter, the feed.", "Physical · Digital · Paired", ""],
  ["// SOUND", "Sound & Drive", "Music and cars, the lifestyle thread.", "Physical · Digital · Paired", ""],
  ["// OUT", "Out", "Outdoor & activity gear.", "Physical · Digital · Paired", ""],
  ["// MOVE", "Move & Fuel", "Fitness, nutrition, recovery, healthy living.", "Physical · Digital · Paired", "feat"],
  ["// _", "Whatever's next", "The catalog grows with the curation.", "Coming soon", ""],
];

export const EDITIONS = [
  { tier: "Founder Edition", rc: "founder", gem: "◆◆◆", cls: "r-founder holo", no: "003", of: "050", hash: "0x9F3A·C21E", note: "Holographic foil" },
  { tier: "Rare Edition", rc: "rare", gem: "◆◆", cls: "r-rare holo", no: "061", of: "150", hash: "0x7B12·A4D9", note: "Iridescent sheen" },
  { tier: "Standard", rc: "standard", gem: "◆", cls: "", no: "312", of: "500", hash: "0x33C8·5E10", note: "Matte black" },
];

export const STATS = [
  ["7", "worlds", false],
  ["500", "units / drop", false],
  ["500", "founding spots", true],
  ["3", "product formats", true],
];

export const FEED = [
  ["01", "A pocket tool worth carrying", "The one multi-tool that earns its place. + a desk-setup template."],
  ["02", "The drive playlist", "47 minutes for the good road. Streamed + a printable route card."],
  ["03", "Recovery, simplified", "A banded mini-kit + a 2-week mobility program you actually finish."],
];

export const INTERESTS = ["Carry", "Wear", "Play", "Read", "Sound", "Cars", "Outdoors", "Fitness"];

export const FAQ = [
  ["What exactly is Byte Sized Co.?", "A generalist company for small, considered things across the worlds we live in. A release might be useful, expressive, interesting, or simply cool to own. The category can change. The standard does not."],
  ["What formats can a product take?", "Whatever best fits the idea: digital-only, physical-only, or a physical and digital pairing. Pairing is an option, not a requirement."],
  ["Are these NFTs or crypto?", "No, definitely not. There's no blockchain, token, wallet, minting, or trading. Paired editions are ordinary collectibles: a physical item you own plus a digital companion you keep. The cards mark founding supporters of the store."],
  ["What does the waitlist get me?", "Founding members get guaranteed early access to Drop 001, a permanent low member number, and founding-member pricing. The first 500 only."],
  ["When does Drop 001 land?", "Soon. We're finishing the first release now. Join the list and you'll be first to know, before it's public."],
];

// FAQ rich-result markup, built from the same array the section renders so the two
// can never drift apart. "<" is escaped so an answer can never close the tag early.
export const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}).replace(/</g, "\\u003c");

// Boot-screen intro lines: [text, status].
export const BOOT_LINES = [
  ["> initializing curator", "ok"],
  ["> mounting seven worlds", "ok"],
  ["> loading three formats", "ok"],
  ["> rendering Drop 001", "ok"],
  ["> waitlist", "OPEN"],
];

// Hero typewriter phrases, in order.
export const TYPE_PHRASES = ["small things, done right", "digital. physical. or both.", "numbered. limited. yours.", "the good stuff, found for you"];
