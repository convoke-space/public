import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { published } from "@/lib/content";
import { absoluteUrl, canonicalUrl, isIndexable, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  alternates: {
    canonical: canonicalUrl("/"),
    types: {
      "application/rss+xml": [
        { url: absoluteUrl("/feed.xml"), title: `${siteConfig.name} — Writing` },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: canonicalUrl("/"),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation only advertises destinations that actually hold something.
  const counts = {
    posts: published("posts").length,
    projects: published("projects").length,
    events: published("events").length,
  };

  const nav = siteConfig.nav
    .filter((item) => !item.requiresContent || counts[item.requiresContent] > 0)
    .map(({ href, label }) => ({ href, label }));

  return (
    <html lang={siteConfig.locale}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>

        <SiteHeader nav={nav} siteName={siteConfig.name} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter hasEvents={counts.events > 0} />
      </body>
    </html>
  );
}
