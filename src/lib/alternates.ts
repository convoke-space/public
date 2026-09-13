import { LOCALES } from "../../site.config";
import { getCounterpart, type Entry } from "./content";
import { localePath } from "./site";
import { SECTION_PATH } from "./navigation";
import type { LanguageTarget } from "@/components/language-switcher";
import type { LocaleAlternates } from "./seo";

/**
 * One place computes both hreflang alternates and language-switch targets, so
 * the two can never disagree — and neither can point at an edition that does
 * not exist.
 */

/** A page that exists at the same path in every locale (sections, About, home). */
export function sharedPage(path: string): LocaleAlternates {
  return Object.fromEntries(LOCALES.map((locale) => [locale, path]));
}

/** An entry: only the locales whose edition is actually published. */
export function entryAlternates(entry: Entry): LocaleAlternates {
  const alternates: LocaleAlternates = {};
  for (const locale of LOCALES) {
    const counterpart = getCounterpart(entry, locale);
    if (counterpart) {
      alternates[locale] =
        `${SECTION_PATH[counterpart.collection]}/${counterpart.slug}`;
    }
  }
  return alternates;
}

/** Turn locale-relative alternates into absolute switcher targets. */
export function languageTargets(alternates: LocaleAlternates): LanguageTarget[] {
  return LOCALES.map((locale) => {
    const path = alternates[locale];
    return { locale, href: path ? localePath(locale, path) : null };
  });
}
