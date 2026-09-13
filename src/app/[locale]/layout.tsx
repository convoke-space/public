import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import "../globals.css";
import { LOCALES, siteConfig, type Locale } from "../../../site.config";
import { getDictionary, isLocale } from "@/lib/i18n";
import { absoluteUrl, canonicalUrl, isIndexable, localePath } from "@/lib/site";

/**
 * Root layout for every localized route.
 *
 * It is a second root layout (see `app/(gateway)/layout.tsx`) purely so that
 * `<html lang>` follows the route's locale, which a single shared root layout
 * cannot do — a layout only sees its own segment's params.
 *
 * The header and footer are rendered by each page through `PageShell`, because
 * the language switcher's targets depend on the page.
 */

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

/** Only `ko` and `en` exist; anything else falls through to the global 404. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: {
      default: `${siteConfig.name} — ${dict.tagline}`,
      template: `%s — ${siteConfig.name}`,
    },
    description: dict.siteDescription,
    applicationName: siteConfig.name,
    alternates: {
      canonical: canonicalUrl(localePath(locale, "/")),
      types: {
        "application/rss+xml": [
          {
            url: canonicalUrl(localePath(locale, "/feed.xml")),
            title: dict.feed.title,
          },
        ],
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.openGraphLocale[locale],
    },
    twitter: { card: "summary_large_image" },
    robots: isIndexable()
      ? { index: true, follow: true }
      : { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={siteConfig.htmlLang[locale]}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          {getDictionary(locale).skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
