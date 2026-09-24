import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { LOCALES, DEFAULT_LOCALE, siteConfig } from "../../site.config";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/site";

/**
 * The one 404 for the whole site.
 *
 * Every unmatched route resolves here — an unknown path under `/ko` or `/en`,
 * an unsupported prefix like `/fr`, an unknown slug, or a bare `/nonexistent`.
 * Next uses this file as the layout rather than nesting it inside one, so it
 * owns the document: a complete server-rendered `<html>` with a real 404
 * status, no hydration required.
 *
 * It is deliberately bilingual rather than locale-specific. Making the copy
 * follow the route would mean reaching for the pathname from a place the
 * framework does not offer it, and an error surface is worth less than the
 * simplicity that would cost. Both languages are offered as equals, and both
 * recovery links are always present.
 */

export const metadata: Metadata = {
  title: `404 — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    // One document language has to be chosen; it is the authoring language.
    // The English block carries its own `lang`.
    <html lang={siteConfig.htmlLang[DEFAULT_LOCALE]}>
      <body className="flex min-h-dvh flex-col antialiased">
        <main
          id="main"
          className="mx-auto flex w-full max-w-[64rem] flex-1 flex-col justify-center px-5 py-20 sm:px-8"
        >
          <h1 className="eyebrow mb-10">404</h1>

          <div className="space-y-10">
            {LOCALES.map((locale) => {
              const dict = getDictionary(locale);
              return (
                <section key={locale} lang={siteConfig.htmlLang[locale]}>
                  <h2 className="font-serif text-[1.5rem] leading-tight sm:text-[1.9rem]">
                    {dict.notFound.title}
                  </h2>
                  <p className="mt-2 max-w-[52ch] text-[0.98rem] text-muted">
                    {dict.notFound.lede}
                  </p>
                  <p className="mt-3">
                    <Link
                      href={localePath(locale, "/")}
                      hrefLang={siteConfig.htmlLang[locale]}
                      className="link-underline text-[0.95rem]"
                    >
                      {dict.notFound.home}
                    </Link>
                  </p>
                </section>
              );
            })}
          </div>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
