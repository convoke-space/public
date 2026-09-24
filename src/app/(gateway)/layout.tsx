import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { DEFAULT_LOCALE, siteConfig } from "../../../site.config";
import { getDictionary } from "@/lib/i18n";
import { absoluteUrl, canonicalUrl, isIndexable, localePath } from "@/lib/site";

/**
 * Root layout for the locale-neutral gateway at `/`.
 *
 * Convoke has two root layouts — this one and `app/[locale]/layout.tsx` — so
 * that `<html lang>` can be correct on every route without a middleware
 * redirect. The document language here is the authoring language; the English
 * half of the page carries its own `lang` attribute.
 */

const dict = getDictionary(DEFAULT_LOCALE);

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: `${siteConfig.name} — 한국어 / English`,
  description: dict.siteDescription,
  applicationName: siteConfig.name,
  alternates: {
    canonical: canonicalUrl("/"),
    languages: {
      ko: canonicalUrl(localePath("ko", "/")),
      en: canonicalUrl(localePath("en", "/")),
      "x-default": canonicalUrl("/"),
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: canonicalUrl("/"),
    title: siteConfig.name,
    description: dict.siteDescription,
  },
  twitter: { card: "summary_large_image" },
  robots: isIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function GatewayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.htmlLang[DEFAULT_LOCALE]}>
      <body className="flex min-h-dvh flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
