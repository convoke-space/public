import Link from "next/link";
import { LOCALES, siteConfig, type Locale } from "../../site.config";
import { getDictionary } from "@/lib/i18n";

export type LanguageTarget = {
  locale: Locale;
  /** Absolute site path, or null when this edition does not exist. */
  href: string | null;
};

/**
 * Accessible language switch.
 *
 * The current language is announced rather than linked, and a language with no
 * edition of this piece is rendered as plain text — never as a link to a URL
 * that would 404.
 */
export function LanguageSwitcher({
  current,
  targets,
}: {
  current: Locale;
  targets: LanguageTarget[];
}) {
  const dict = getDictionary(current);

  return (
    <nav aria-label={dict.languageSwitch.label}>
      <ul className="flex items-baseline gap-x-2 text-[0.8rem]">
        {LOCALES.map((locale, index) => {
          const target = targets.find((t) => t.locale === locale);
          const label = getDictionary(locale).languageShort;
          const longName = getDictionary(locale).languageName;

          return (
            <li key={locale} className="flex items-baseline gap-x-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-rule">
                  /
                </span>
              ) : null}

              {locale === current ? (
                <span
                  aria-current="true"
                  lang={siteConfig.htmlLang[locale]}
                  className="text-ink"
                >
                  {label}
                  <span className="sr-only">
                    {` (${dict.languageSwitch.current}: ${longName})`}
                  </span>
                </span>
              ) : target?.href ? (
                <Link
                  href={target.href}
                  hrefLang={siteConfig.htmlLang[locale]}
                  lang={siteConfig.htmlLang[locale]}
                  aria-label={dict.languageSwitch.to[locale]}
                  className="text-muted transition-colors hover:text-ink"
                >
                  {label}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  lang={siteConfig.htmlLang[locale]}
                  className="text-faint"
                >
                  {label}
                  <span className="sr-only">
                    {` — ${dict.languageSwitch.unavailable[locale]}`}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
