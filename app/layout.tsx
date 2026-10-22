import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { artist, bio, getText } from "@/data/presskit";
import { FrequencyProvider } from "@/components/over-emotions/frequency-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { BookingDrawer } from "@/components/ui/booking-drawer";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

/**
 * TYPOGRAPHY
 * ----------
 *   Climate Crisis  display. A variable face whose YEAR axis literally melts the
 *                   letters — the hero animates it, headings sit near solid.
 *   Chakra Petch    interface labels, readouts, buttons. Angular, a little alien.
 *   Manrope         long-form paragraphs.
 */

// Self-hosted (app/fonts) so builds never depend on reaching Google Fonts.
const climate = localFont({
  src: "./fonts/ClimateCrisis-YEAR.woff2",
  display: "swap",
  variable: "--font-climate",
  fallback: ["Arial Black", "sans-serif"],
});

const chakra = localFont({
  src: [
    { path: "./fonts/chakra-petch-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/chakra-petch-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/chakra-petch-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-chakra",
  fallback: ["Arial Narrow", "sans-serif"],
});

const manrope = localFont({
  src: "./fonts/Manrope-wght.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: `${artist.name} — ${getText(artist.role, "es")}`,
    template: `%s — ${artist.name}`,
  },
  description: getText(artist.metaDescription, "es"),
  applicationName: `${artist.name} EPK`,
  keywords: [
    "Over Emotions",
    "Humberto Loya",
    "psytrance",
    "full on",
    "progressive trance",
    "psytech",
    "DJ",
    "productor",
    "Chihuahua",
    "México",
    "booking",
    "press kit",
  ],
  // Base for the absolute URLs that Facebook / WhatsApp / X need for the share
  // image. On Vercel this falls back to the production domain automatically.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  // Share image, icons: app/opengraph-image.jpg, app/twitter-image.jpg,
  // app/icon.png and app/apple-icon.png are picked up by file convention.
  openGraph: {
    title: `${artist.name} — Press Kit`,
    description: getText(bio.oneLiner, "es"),
    siteName: `${artist.name} EPK`,
    locale: "es_MX",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${artist.name} — Press Kit`,
    description: getText(bio.oneLiner, "es"),
  },
  // Flip to index once the placeholder music/video/photo assets are replaced.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom is never disabled.
  maximumScale: 5,
  themeColor: "#07050C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      // The site is dark-only by design; declaring it stops the UA from
      // rendering form controls and scrollbars in a light theme.
      className={`${climate.variable} ${chakra.variable} ${manrope.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-void text-bone antialiased">
        <FrequencyProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            {/* Mounted once at the root so any button can open it */}
            <BookingDrawer />
            {/* Self-disables on touch, on reduced motion, and below HIGH tier */}
            <CustomCursor />
          </TooltipProvider>
        </FrequencyProvider>
      </body>
    </html>
  );
}
