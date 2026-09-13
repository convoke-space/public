import Link from "next/link";
import { siteConfig, type Locale } from "../../site.config";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import { Container } from "./container";
import { LanguageSwitcher, type LanguageTarget } from "./language-switcher";

export type HeaderNavItem = {
  /** Locale-relative path. */
  path: string;
  label: string;
};

/**
 * Rendered by each page rather than by the layout, because the language
 * switcher's targets depend on the page: a section maps to the same section,
 * an article maps to its counterpart — which only the page can look up.
 */
export function SiteHeader({
  locale,
  nav,
  languageTargets,
  activePath,
}: {
  locale: Locale;
  nav: HeaderNavItem[];
  languageTargets: LanguageTarget[];
  /** Locale-relative path of the section this page belongs to. */
  activePath?: string;
}) {
  return (
    <header className="border-b border-rule">
      <Container
        width="wide"
        className="flex flex-wrap items-baseline gap-x-6 gap-y-3 py-4 sm:py-5"
      >
        <Link
          href={localePath(locale, "/")}
          className="font-serif text-lg font-semibold tracking-tight"
        >
          {siteConfig.name}
          <span className="text-accent" aria-hidden="true">
            .
          </span>
          <span className="sr-only">{` — ${getDictionary(locale).nav.home}`}</span>
        </Link>

        <nav aria-label={getDictionary(locale).nav.primary} className="ml-auto">
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.9rem]">
            {nav.map((item) => {
              const active =
                activePath === item.path ||
                (activePath?.startsWith(`${item.path}/`) ?? false);
              return (
                <li key={item.path}>
                  <Link
                    href={localePath(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "text-ink underline decoration-accent decoration-1 underline-offset-[0.35em]"
                        : "text-muted transition-colors hover:text-ink"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-l border-rule pl-5">
          <LanguageSwitcher current={locale} targets={languageTargets} />
        </div>
      </Container>
    </header>
  );
}
