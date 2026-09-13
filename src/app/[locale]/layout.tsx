import type { Metadata, Viewport } from "next";
import "../globals.css";
import { DEFAULT_LOCALE, LOCALES, siteConfig, type Locale } from "../../../site.config";
import { getDictionary, isLocale } from "@/lib/i18n";
import { setRequestLocale } from "@/lib/request-locale";
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

/**
 * An unsupported prefix such as `/fr` renders on demand so that the page below
 * can 404 into the shared boundary, rather than hitting Next's bare built-in
 * page. This layout must not call `notFound()` itself: a layout that throws is
 * the one that would have contained the boundary, and Next then has nothing to
 * render it in.
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    // Unsupported prefix: the page below will 404. Say nothing indexable here.
    return { metadataBase: new URL(absoluteUrl("/")), robots: { index: false, follow: false } };
  }
  const locale = raw;
  setRequestLocale(locale);
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
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : null;
  if (locale) setRequestLocale(locale);

  // An unsupported prefix still needs a document shell for the 404 below it.
  const documentLocale = locale ?? DEFAULT_LOCALE;

  return (
    <html lang={siteConfig.htmlLang[documentLocale]}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          {getDictionary(documentLocale).skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
