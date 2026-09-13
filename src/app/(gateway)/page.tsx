import Link from "next/link";
import { LOCALES, siteConfig } from "../../../site.config";
import { Container } from "@/components/container";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/site";

/**
 * Bilingual gateway.
 *
 * `/` is not a language page. It offers an explicit choice and nothing else —
 * no browser-language redirect, so the behaviour is deterministic for readers,
 * bots and `x-default` alike. A remembered preference can be layered on later
 * without changing this contract.
 */
export default function GatewayPage() {
  return (
    <main id="main" className="flex flex-1 items-center">
      <Container width="page" className="py-20">
        <p className="eyebrow mb-4">{siteConfig.name}</p>

        <h1 className="sr-only">
          {`${siteConfig.name} — 한국어 / English`}
        </h1>

        <ul className="divide-y divide-rule border-y border-rule">
          {LOCALES.map((locale) => {
            const dict = getDictionary(locale);
            return (
              <li key={locale}>
                <Link
                  href={localePath(locale, "/")}
                  lang={siteConfig.htmlLang[locale]}
                  hrefLang={siteConfig.htmlLang[locale]}
                  className="group block py-8 sm:py-10"
                >
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-serif text-[1.75rem] leading-tight underline decoration-transparent decoration-1 underline-offset-[0.25em] transition-[text-decoration-color] group-hover:decoration-accent sm:text-[2.25rem]">
                      {dict.languageName}
                    </span>
                    <span className="eyebrow">{dict.languageShort}</span>
                  </span>
                  <span className="mt-2 block max-w-[52ch] text-[0.95rem] text-muted">
                    {dict.tagline}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </main>
  );
}
