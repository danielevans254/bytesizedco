/* Shared sample data for template previews (/dev/emails). Never used to send.
   Templates export their own `preview` props and may build on these. */

export const SAMPLE_CUSTOMER = { name: "Sam Rivera" };

export const SAMPLE_ORDER = {
  drop: "DROP::OCTET",
  orderId: "BSC-1042",
  edition: "No. 042 / 500",
};

export const SAMPLE_ITEMS = [
  { name: "OCTET Desk Tile", tierLabel: "Founder", variant: "Graphite", qty: 1, price: 48 },
  { name: "OCTET Companion Pack", tierLabel: "Standard", qty: 1, price: 12 },
];
