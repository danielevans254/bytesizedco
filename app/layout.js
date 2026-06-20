import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-display",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://bytesized.co"),
  title: "Byte Sized Co. · Your world, simplified.",
  description:
    "The marketplace for modern utility, connecting the physical and digital elements of your busy life.",
  openGraph: {
    title: "Byte Sized Co. · Your world, simplified.",
    description:
      "The marketplace for modern utility, connecting the physical and digital elements of your busy life.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#08090B",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
