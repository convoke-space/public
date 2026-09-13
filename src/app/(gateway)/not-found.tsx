import Link from "next/link";
import { LOCALES, siteConfig } from "../../../site.config";
import { Container } from "@/components/container";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/site";

/**
 * Root-level 404, for addresses that do not carry a supported locale prefix.
 * It cannot know the reader's language, so it says so in both.
 */
export default function GatewayNotFound() {
  return (
    <main id="main" className="flex flex-1 items-center">
      <Container width="page" className="py-20">
        <p className="eyebrow mb-4">404</p>

        <ul className="space-y-10">
          {LOCALES.map((locale) => {
            const dict = getDictionary(locale);
            return (
              <li key={locale} lang={siteConfig.htmlLang[locale]}>
                <h2 className="font-serif text-[1.5rem] leading-tight sm:text-[1.9rem]">
                  {dict.notFound.title}
                </h2>
                <p className="mt-2 max-w-[52ch] text-[0.95rem] text-muted">
                  {dict.notFound.lede}
                </p>
                <p className="mt-3 text-[0.9rem]">
                  <Link
                    href={localePath(locale, "/")}
                    hrefLang={siteConfig.htmlLang[locale]}
                    className="link-underline"
                  >
                    {dict.languageSwitch.to[locale]}
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </main>
  );
}
