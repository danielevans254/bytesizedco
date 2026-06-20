// Sample products, 2 per department. Each declares:
//  - tiers     : rarity editions (Standard / Rare / Founder), cross-cuts everything
//  - options[] : type-specific variant axes (size, swatch, format, bundle, level, text, toggle)
//  - modules[] : content modules (inline accordion or modal) unique to the product type
// The ProductConfigurator renders options; ProductModules renders modules.

const tiers = (base) => [
  { key: "standard", label: "Standard", gem: "◆", cls: "", rc: "standard", price: base, of: 500 },
  { key: "rare", label: "Rare", gem: "◆◆", cls: "r-rare", rc: "rare", price: Math.round(base * 1.4), of: 150 },
  { key: "founder", label: "Founder", gem: "◆◆◆", cls: "r-founder", rc: "founder", price: Math.round(base * 2), of: 50 },
];

const SIZE_GUIDE = {
  cols: ["Size", "Chest (in)", "Length (in)"],
  rows: [["XS", "37", "27"], ["S", "39", "28"], ["M", "41", "29"], ["L", "44", "30"], ["XL", "47", "31"], ["XXL", "50", "32"]],
  note: "Garment measured flat. Model is 6'1\", wears M.",
};

const RAW = [
  // ───────────── CARRY ─────────────
  {
    slug: "machined-desk-tray", dept: "Carry & Everyday", deptTag: "// CARRY", art: "carry",
    name: "Machined Desk Tray", tagline: "A home for the small things you reach for all day.", base: 42, drop: "Drop 002",
    physical: { title: "CNC desk tray", desc: "Anodized 6061 aluminium, milled from a single block. Soft-touch base, three compartments." },
    digital: { title: "Desk OS template", desc: "A Notion desk-setup template plus a matching wallpaper pack, tuned to the tray." },
    specs: [["Material", "6061 aluminium"], ["Size", "180 × 90 mm"], ["Finish", "Matte anodized"], ["Pairing", "Tray + template"]],
    options: [
      { id: "finish", type: "swatch", label: "Finish", values: [
        { id: "black", label: "Matte Black", hex: "#16181D" },
        { id: "silver", label: "Silver", hex: "#C9CDD4" },
        { id: "brass", label: "Brass", hex: "#C9A24B", priceDelta: 6 },
      ] },
      { id: "engraving", type: "text", label: "Engraving", max: 12, priceDelta: 5, placeholder: "up to 12 characters" },
    ],
    modules: [
      { type: "materials", display: "inline", title: "Materials & size", data: { rows: [["Body", "6061 aluminium"], ["Base", "Soft-touch silicone"], ["Size", "180 × 90 × 22 mm"], ["Weight", "240 g"]] } },
      { type: "whatsInBox", display: "inline", data: { items: ["Machined tray", "Notion desk template (digital)", "Wallpaper pack (digital)", "Numbered certificate card"] } },
    ],
  },
  {
    slug: "pocket-pen", dept: "Carry & Everyday", deptTag: "// CARRY", art: "carry",
    name: "Pocket Pen", tagline: "The one pen that lives in your pocket.", base: 28, drop: "Drop 002",
    physical: { title: "Machined brass pen", desc: "Knurled brass body, bolt-action, takes a standard refill. Ages with a patina." },
    digital: { title: "Pocket notes kit", desc: "Printable pocket-note cards and a wallpaper set to match." },
    specs: [["Material", "Solid brass"], ["Refill", "Standard D1"], ["Weight", "34 g"], ["Pairing", "Pen + notes"]],
    options: [
      { id: "finish", type: "swatch", label: "Finish", values: [
        { id: "brass", label: "Brass", hex: "#C9A24B" },
        { id: "black", label: "Black", hex: "#16181D" },
      ] },
      { id: "engraving", type: "text", label: "Engraving", max: 12, priceDelta: 5, placeholder: "up to 12 characters" },
    ],
    modules: [
      { type: "materials", display: "inline", title: "Materials & size", data: { rows: [["Body", "Solid brass"], ["Mechanism", "Bolt-action"], ["Length", "128 mm"], ["Weight", "34 g"]] } },
    ],
  },
  // ───────────── WEAR ─────────────
  {
    slug: "the-daily-tee", dept: "Wear", deptTag: "// WEAR", art: "wear",
    name: "The Daily Tee", tagline: "One heavyweight tee, cut right, worn into the ground.", base: 34, drop: "Drop 003",
    physical: { title: "Heavyweight tee", desc: "240gsm combed cotton, boxy cut, double-stitched. A small numbered tag at the hem." },
    digital: { title: "Lookbook + playlist", desc: "A digital lookbook PDF and a curated playlist that matches the drop's mood." },
    specs: [["Fabric", "240gsm cotton"], ["Fit", "Boxy / relaxed"], ["Sizes", "XS–XXL"], ["Pairing", "Tee + lookbook"]],
    options: [
      { id: "size", type: "size", label: "Size", required: true, values: [
        { id: "XS", label: "XS" }, { id: "S", label: "S" }, { id: "M", label: "M" },
        { id: "L", label: "L" }, { id: "XL", label: "XL" }, { id: "XXL", label: "XXL", priceDelta: 2 },
      ] },
      { id: "color", type: "swatch", label: "Colourway", values: [
        { id: "black", label: "Black", hex: "#15181E" },
        { id: "bone", label: "Bone", hex: "#E7E2D6" },
        { id: "forest", label: "Forest", hex: "#243A2E" },
      ] },
    ],
    modules: [
      { type: "sizeGuide", display: "modal", data: SIZE_GUIDE },
      { type: "materials", display: "inline", title: "Fabric & care", data: { rows: [["Fabric", "240gsm combed cotton"], ["Fit", "Boxy / relaxed"], ["Care", "Wash cold, hang dry"], ["Tag", "Numbered hem tag"]] } },
    ],
  },
  {
    slug: "five-panel-cap", dept: "Wear", deptTag: "// WEAR", art: "wear",
    name: "5-Panel Cap", tagline: "Low profile, all-day, quietly numbered.", base: 30, drop: "Drop 003",
    physical: { title: "5-panel cap", desc: "Brushed cotton twill, embroidered mark, adjustable strap. Packs flat." },
    digital: { title: "Fit guide + wallpaper", desc: "A styling guide and a wallpaper pack in the drop's colourway." },
    specs: [["Fabric", "Cotton twill"], ["Fit", "Adjustable"], ["Mark", "Embroidered"], ["Pairing", "Cap + guide"]],
    options: [
      { id: "color", type: "swatch", label: "Colourway", values: [
        { id: "black", label: "Black", hex: "#15181E" },
        { id: "olive", label: "Olive", hex: "#3A3F2C" },
        { id: "sand", label: "Sand", hex: "#C8B68E" },
      ] },
    ],
    modules: [
      { type: "materials", display: "inline", title: "Fabric & fit", data: { rows: [["Fabric", "Brushed cotton twill"], ["Fit", "Adjustable strap"], ["Mark", "Embroidered"]] } },
    ],
  },
  // ───────────── PLAY ─────────────
  {
    slug: "pocket-card-game", dept: "Play", deptTag: "// PLAY", art: "play",
    name: "Pocket Card Game", tagline: "A small-box game for the table you actually have.", base: 24, drop: "Drop 004",
    physical: { title: "54-card mini game", desc: "A linen-finish deck in a rigid tuck box. 2–5 players, ten minutes a round." },
    digital: { title: "Print-and-play expansion", desc: "A downloadable expansion pack plus a two-minute rules video. New cards every season." },
    specs: [["Cards", "54 + 6 expansion"], ["Players", "2–5"], ["Time", "~10 min"], ["Pairing", "Deck + PnP pack"]],
    options: [
      { id: "edition", type: "bundle", label: "Edition", values: [
        { id: "deck", label: "Base deck", sub: "54 cards + digital expansion" },
        { id: "deckplus", label: "Deck + bonus pack", sub: "extra printed promo cards", priceDelta: 8 },
      ] },
    ],
    modules: [
      { type: "howToPlay", display: "inline", data: { players: "2–5", time: "~10 min", steps: ["Deal five cards to each player.", "On your turn, play a card or pass.", "First to empty their hand wins the round.", "Best of three takes the game."] } },
      { type: "whatsInBox", display: "inline", data: { items: ["54-card deck", "Rigid tuck box", "Print-and-play expansion (digital)", "Rules video (digital)"] } },
    ],
  },
  {
    slug: "sticker-pack-01", dept: "Play", deptTag: "// PLAY", art: "play",
    name: "Sticker Pack 01", tagline: "Eight die-cuts and a matching wallpaper set.", base: 12, drop: "Drop 001",
    physical: { title: "8 die-cut stickers", desc: "Matte vinyl, weatherproof, kiss-cut on a numbered backing card." },
    digital: { title: "Wallpaper set", desc: "The same artwork as a phone and desktop wallpaper pack." },
    specs: [["Count", "8 stickers"], ["Material", "Matte vinyl"], ["Finish", "Weatherproof"], ["Pairing", "Pack + wallpapers"]],
    options: [
      { id: "size", type: "format", label: "Pack", values: [
        { id: "p4", label: "4-pack", priceDelta: -4 },
        { id: "p8", label: "8-pack" },
        { id: "sheet", label: "Full sheet", priceDelta: 6 },
      ] },
    ],
    modules: [
      { type: "materials", display: "inline", title: "Materials", data: { rows: [["Material", "Matte vinyl"], ["Cut", "Kiss-cut die-cut"], ["Finish", "Weatherproof, UV-safe"]] } },
    ],
  },
  // ───────────── READ ─────────────
  {
    slug: "field-notes-zine", dept: "Read & Feed", deptTag: "// READ", art: "read",
    name: "Field Notes Zine", tagline: "Thirty-two pages of the good stuff, on paper.", base: 16, drop: "Drop 001",
    physical: { title: "32-page riso zine", desc: "Risograph printed in two colours on uncoated stock. Saddle-stitched, numbered." },
    digital: { title: "The subscriber feed", desc: "A year of the digital feed plus the full reading list, links and all." },
    specs: [["Pages", "32"], ["Print", "Two-colour riso"], ["Size", "A5"], ["Pairing", "Zine + feed"]],
    options: [],
    modules: [
      { type: "sample", display: "modal", data: { spreads: 3 } },
      { type: "materials", display: "inline", title: "Print details", data: { rows: [["Pages", "32"], ["Print", "Two-colour risograph"], ["Stock", "Uncoated"], ["Size", "A5, saddle-stitched"]] } },
    ],
  },
  {
    slug: "the-reading-list", dept: "Read & Feed", deptTag: "// READ", art: "read",
    name: "The Reading List", tagline: "A year of our picks, bound on paper.", base: 26, drop: "Drop 005",
    physical: { title: "Hardcover edition", desc: "A slim hardcover collecting the year's best picks, with notes in the margins." },
    digital: { title: "Live linked list", desc: "The same list, digital and always current, with every link." },
    specs: [["Format", "Hardcover"], ["Pages", "96"], ["Updates", "Live digital"], ["Pairing", "Book + list"]],
    options: [],
    modules: [
      { type: "sample", display: "modal", data: { spreads: 3 } },
      { type: "materials", display: "inline", title: "Book details", data: { rows: [["Format", "Hardcover"], ["Pages", "96"], ["Updates", "Live digital list"]] } },
    ],
  },
  // ───────────── SOUND ─────────────
  {
    slug: "drive-tape-vol-1", dept: "Sound & Drive", deptTag: "// SOUND", art: "sound",
    name: "Drive Tape, Vol. 1", tagline: "Forty-seven minutes for the good road.", base: 26, drop: "Drop 005",
    physical: { title: "Cassette + enamel pin", desc: "A real cassette in a printed sleeve, with a hard-enamel pin to match." },
    digital: { title: "Playlist + route cards", desc: "The full streaming playlist plus printable route cards for three great drives." },
    specs: [["Format", "Cassette"], ["Runtime", "47 min"], ["Extras", "Enamel pin"], ["Pairing", "Tape + playlist"]],
    options: [
      { id: "format", type: "format", label: "Format", values: [
        { id: "cassette", label: "Cassette" },
        { id: "vinyl", label: "Vinyl", priceDelta: 14 },
      ] },
      { id: "bundle", type: "bundle", label: "Bundle", values: [
        { id: "tape", label: "Tape only", sub: "the cassette + digital" },
        { id: "tapepin", label: "Tape + enamel pin", sub: "add the matching pin", priceDelta: 8 },
      ] },
    ],
    modules: [
      { type: "audio", display: "inline", data: { label: "Preview · Coast Road" } },
      { type: "tracklist", display: "inline", data: { runtime: "47 min", tracks: [["01", "Opening Mile", "3:42"], ["02", "Coast Road", "4:08"], ["03", "Night Shift", "3:55"], ["04", "Long Way Home", "5:01"], ["05", "Last Exit", "4:20"]] } },
      { type: "whatsInBox", display: "inline", data: { items: ["Cassette in printed sleeve", "Hard-enamel pin", "Streaming playlist (digital)", "Printable route cards (digital)"] } },
    ],
  },
  {
    slug: "enamel-pin-set", dept: "Sound & Drive", deptTag: "// SOUND", art: "sound",
    name: "Enamel Pin Set", tagline: "Three hard-enamel pins, one little board.", base: 18, drop: "Drop 005",
    physical: { title: "3 hard-enamel pins", desc: "Gold-plated, rubber backs, on a printed numbered board." },
    digital: { title: "Sticker + wallpaper", desc: "Digital versions of each pin as stickers and wallpapers." },
    specs: [["Count", "3 pins"], ["Plating", "Gold"], ["Backs", "Rubber"], ["Pairing", "Pins + wallpapers"]],
    options: [],
    modules: [
      { type: "materials", display: "inline", title: "Pin details", data: { rows: [["Count", "3 pins"], ["Plating", "Gold"], ["Backs", "Rubber clutch"], ["Board", "Numbered, printed"]] } },
    ],
  },
  // ───────────── OUT ─────────────
  {
    slug: "trail-kit", dept: "Out", deptTag: "// OUT", art: "out",
    name: "Trail Kit", tagline: "The small set that earns its place in the pack.", base: 48, drop: "Drop 006",
    physical: { title: "Packable trail tool + patch", desc: "A featherweight multi-tool and a woven patch, in a waxed-canvas pouch." },
    digital: { title: "Maps + packing template", desc: "Offline trail maps and a packing-list template you can reuse every trip." },
    specs: [["Weight", "92 g"], ["Tool", "7-in-1"], ["Pouch", "Waxed canvas"], ["Pairing", "Tool + maps"]],
    options: [
      { id: "bundle", type: "bundle", label: "Bundle", values: [
        { id: "tool", label: "Tool only", sub: "multi-tool + patch" },
        { id: "toolpouch", label: "Tool + waxed pouch", sub: "add the canvas pouch", priceDelta: 10 },
      ] },
      { id: "color", type: "swatch", label: "Pouch", values: [
        { id: "tan", label: "Tan", hex: "#B59A6E" },
        { id: "olive", label: "Olive", hex: "#3A3F2C" },
      ] },
    ],
    modules: [
      { type: "packing", display: "inline", data: { items: ["7-in-1 multi-tool", "Woven patch", "Waxed-canvas pouch", "Offline trail maps (digital)", "Packing-list template (digital)"] } },
      { type: "materials", display: "inline", title: "Specs", data: { rows: [["Weight", "92 g"], ["Tool", "7-in-1 stainless"], ["Pouch", "Waxed canvas"]] } },
    ],
  },
  {
    slug: "trail-patch", dept: "Out", deptTag: "// OUT", art: "out",
    name: "Trail Patch", tagline: "A woven badge for the pack that's been places.", base: 14, drop: "Drop 006",
    physical: { title: "Woven patch", desc: "Iron-on woven patch on a numbered backing card. Built to take a beating." },
    digital: { title: "Trail log template", desc: "A digital trail log and a wallpaper to match the badge." },
    specs: [["Size", "75 mm"], ["Type", "Woven"], ["Back", "Iron-on"], ["Pairing", "Patch + log"]],
    options: [],
    modules: [
      { type: "materials", display: "inline", title: "Patch details", data: { rows: [["Size", "75 mm"], ["Type", "Woven"], ["Back", "Iron-on"]] } },
    ],
  },
  // ───────────── MOVE ─────────────
  {
    slug: "reset-kit", dept: "Move & Fuel", deptTag: "// MOVE", art: "move",
    name: "Reset Kit", tagline: "Small, doable wins. A kit you'll actually finish.", base: 44, drop: "Drop 007",
    physical: { title: "Banded mini-kit + shaker", desc: "Three resistance bands and a steel shaker, in a flat zip case that travels." },
    digital: { title: "Program + macro tracker", desc: "A two-week bodyweight program and a hydration + macro tracker template." },
    specs: [["Bands", "3 (light–heavy)"], ["Shaker", "Steel, 500 ml"], ["Program", "2 weeks"], ["Pairing", "Kit + program"]],
    options: [
      { id: "level", type: "level", label: "Resistance", values: [
        { id: "light", label: "Light" },
        { id: "medium", label: "Medium" },
        { id: "heavy", label: "Heavy" },
        { id: "set", label: "Full set (3)", priceDelta: 8 },
      ] },
    ],
    modules: [
      { type: "program", display: "inline", data: { weeks: [["Week 1", "Foundation — full-body, 3 sessions, banded basics."], ["Week 2", "Build — added volume, mobility finisher, one conditioning day."]] } },
      { type: "whatsInBox", display: "inline", data: { items: ["Resistance band(s)", "Steel shaker, 500 ml", "Flat zip case", "2-week program (digital)", "Macro tracker template (digital)"] } },
    ],
  },
  {
    slug: "habit-journal", dept: "Move & Fuel", deptTag: "// MOVE", art: "move",
    name: "Habit Journal", tagline: "Track the small wins until they stick.", base: 22, drop: "Drop 007",
    physical: { title: "90-day journal", desc: "A lay-flat habit journal, dot-grid, numbered first edition." },
    digital: { title: "Streak tracker", desc: "A digital streak tracker and dashboard that mirrors the journal." },
    specs: [["Pages", "90 days"], ["Layout", "Dot grid"], ["Binding", "Lay-flat"], ["Pairing", "Journal + tracker"]],
    options: [
      { id: "cover", type: "swatch", label: "Cover", values: [
        { id: "ink", label: "Ink", hex: "#15181E" },
        { id: "clay", label: "Clay", hex: "#9A6A4F" },
        { id: "sage", label: "Sage", hex: "#5E6F52" },
      ] },
    ],
    modules: [
      { type: "materials", display: "inline", title: "Journal details", data: { rows: [["Pages", "90 days"], ["Layout", "Dot grid"], ["Binding", "Lay-flat"]] } },
    ],
  },
];

export const PRODUCTS = RAW.map((p) => ({ ...p, price: p.base, tiers: tiers(p.base) }));

export function getProduct(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}
