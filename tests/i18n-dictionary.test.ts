import { describe, expect, it } from "vitest";
import { LOCALES } from "../site.config";
import { getDictionary, type Dictionary } from "@/lib/i18n";

/**
 * TypeScript already guarantees that both dictionaries define every key. These
 * tests catch what it cannot: a key that was copied across and left in the
 * wrong language, or left empty.
 */

function flatten(value: unknown, prefix = ""): [string, string][] {
  if (typeof value === "string") return [[prefix, value]];
  if (typeof value === "function") return [];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe("dictionaries", () => {
  it.each(LOCALES)("%s defines every key with a non-empty string", (locale) => {
    for (const [key, value] of flatten(getDictionary(locale))) {
      expect(value.trim(), `${locale}.${key} is empty`).not.toBe("");
    }
  });

  it("defines exactly the same key set in both languages", () => {
    const keys = LOCALES.map((locale) =>
      flatten(getDictionary(locale))
        .map(([key]) => key)
        .sort(),
    );
    expect(keys[0]).toEqual(keys[1]);
  });

  it("writes Korean chrome in Korean and English chrome in English", () => {
    const hangul = /[가-힣]/;
    const ko = getDictionary("ko");
    const en = getDictionary("en");

    for (const key of ["nav.writing", "nav.projects", "nav.about"] as const) {
      const [section, item] = key.split(".") as ["nav", "writing"];
      expect(hangul.test(ko[section][item]), `ko.${key}`).toBe(true);
      expect(hangul.test(en[section][item]), `en.${key}`).toBe(false);
    }

    expect(hangul.test(ko.writing.title)).toBe(true);
    expect(hangul.test(en.writing.title)).toBe(false);
    expect(hangul.test(ko.notFound.title)).toBe(true);
    expect(hangul.test(en.notFound.title)).toBe(false);
  });

  it("names each language in its own language", () => {
    expect(getDictionary("ko").languageName).toBe("한국어");
    expect(getDictionary("en").languageName).toBe("English");
  });

  it("offers a switch label for every locale, in every locale", () => {
    for (const from of LOCALES) {
      const dict: Dictionary = getDictionary(from);
      for (const to of LOCALES) {
        expect(dict.languageSwitch.to[to].trim()).not.toBe("");
        expect(dict.languageSwitch.unavailable[to].trim()).not.toBe("");
      }
    }
  });

  it("formats reading time in the reader's language", () => {
    expect(getDictionary("ko").writing.readingTime(4)).toBe("4분 분량");
    expect(getDictionary("en").writing.readingTime(4)).toBe("4 min read");
  });
});
