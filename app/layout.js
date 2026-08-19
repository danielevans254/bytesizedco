import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SITE_URL } from "./site";
import "./globals.css";

/* ---- analytics ----
   Plausible: cookieless and privacy-friendly, so there is no consent banner to
   render. Nothing loads unless NEXT_PUBLIC_PLAUSIBLE_SRC is set, which keeps dev
   and preview builds out of the numbers.

   NEXT_PUBLIC_PLAUSIBLE_SRC is the script URL from your Plausible site settings
   (current form is https://plausible.io/js/pa-XXXXX.js). NEXT_PUBLIC_PLAUSIBLE_DOMAIN
   is only needed for the older data-domain script variant. The inline shim queues
   plausible() calls made before the script finishes loading, so custom events fired
   from the waitlist form are never dropped. */
const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

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
  metadataBase: new URL(SITE_URL),
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
      <body>
        {children}
        {PLAUSIBLE_SRC && (
          <>
            <Script
              id="plausible"
              src={PLAUSIBLE_SRC}
              data-domain={PLAUSIBLE_DOMAIN || undefined}
              strategy="afterInteractive"
            />
            <Script id="plausible-init" strategy="afterInteractive">
              {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
