import { describe, expect, it } from "vitest";
import { LOCALES, siteConfig } from "../site.config";
import { getDictionary } from "@/lib/i18n";
import { footerSections } from "@/lib/navigation";
import { getRequestLocale, setRequestLocale } from "@/lib/request-locale";
import { localePath } from "@/lib/site";

/**
 * Regression cover for the localized 404.
 *
 * The rendering constraints it works around are documented in
 * docs/ARCHITECTURE.md; what is asserted here is the behaviour that regressed
 * before: a reader on /en/... was shown Korean text and /ko links.
 */

describe("request-scoped locale", () => {
  it("starts null, so an unsupported prefix is distinguishable", () => {
    expect(getRequestLocale()).toBeNull();
  });

  it("keeps nothing in module state between requests", () => {
    // `React.cache` only memoises inside a request, so outside one a write is
    // not visible to the next read. That is the property worth locking down:
    // replacing the store with a module-level variable would make one reader's
    // locale leak into another's 404. The in-request behaviour is verified
    // against a running server instead — see docs/OPERATIONS.md.
    setRequestLocale("en");
    expect(getRequestLocale()).toBeNull();
  });

  it("accepts every supported locale", () => {
    for (const locale of LOCALES) {
      expect(() => setRequestLocale(locale)).not.toThrow();
    }
  });
});

describe("404 copy and links stay in the reader's locale", () => {
  it.each(LOCALES)("%s has its own 404 wording", (locale) => {
    const dict = getDictionary(locale);
    for (const value of [
      dict.notFound.title,
      dict.notFound.lede,
      dict.notFound.body,
    ]) {
      expect(value.trim()).not.toBe("");
    }
  });

  it("writes the Korean 404 in Korean and the English one in English", () => {
    const hangul = /[가-힣]/;
    expect(hangul.test(getDictionary("ko").notFound.title)).toBe(true);
    expect(hangul.test(getDictionary("ko").notFound.lede)).toBe(true);
    expect(hangul.test(getDictionary("en").notFound.title)).toBe(false);
    expect(hangul.test(getDictionary("en").notFound.lede)).toBe(false);
  });

  it.each(LOCALES)("builds every %s 404 link under that locale", (locale) => {
    const links = [
      localePath(locale, "/"),
      ...footerSections(locale).map((section) =>
        localePath(locale, section.path),
      ),
    ];

    expect(links.length).toBeGreaterThan(0);
    for (const href of links) {
      expect(href.startsWith(`/${locale}`)).toBe(true);
      for (const other of LOCALES) {
        if (other === locale) continue;
        expect(href.startsWith(`/${other}/`)).toBe(false);
      }
    }
  });

  it("offers both languages when the prefix is not a supported locale", () => {
    // The bilingual branch of the 404: one entry per locale, each self-labelled.
    for (const locale of LOCALES) {
      const dict = getDictionary(locale);
      expect(dict.languageSwitch.to[locale].trim()).not.toBe("");
      expect(siteConfig.htmlLang[locale]).toBeTruthy();
      expect(localePath(locale, "/")).toBe(`/${locale}`);
    }
  });
});
