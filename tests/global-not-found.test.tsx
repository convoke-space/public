import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LOCALES, DEFAULT_LOCALE, siteConfig } from "../site.config";
import GlobalNotFound, { metadata } from "@/app/global-not-found";
import { getDictionary } from "@/lib/i18n";

/**
 * The 404 rendered as static markup — no hydration, no client runtime.
 *
 * This is the unit-level half of the guard; scripts/verify-http.mjs asserts the
 * same properties against a real production server, where the HTTP status can
 * also be checked. Both exist because the defect this replaced looked correct
 * in a browser and was an empty document to everything else.
 */
const html = renderToStaticMarkup(<GlobalNotFound />);

describe("the global 404", () => {
  it("renders a complete document on the server", () => {
    expect(html).toContain("<html");
    expect(html).toContain("<body");
    expect(html).toMatch(new RegExp(`lang="${siteConfig.htmlLang[DEFAULT_LOCALE]}"`));
  });

  it("offers both languages as equals", () => {
    for (const locale of LOCALES) {
      const dict = getDictionary(locale);
      expect(html).toContain(dict.notFound.title);
      expect(html).toContain(dict.notFound.lede);
      expect(html).toContain(dict.notFound.home);
      expect(html).toContain(`lang="${siteConfig.htmlLang[locale]}"`);
    }
  });

  it("offers a recovery link into every locale", () => {
    for (const locale of LOCALES) {
      expect(html).toContain(`href="/${locale}"`);
    }
  });

  it("has one h1 and a heading per language", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.match(/<h2/g)).toHaveLength(LOCALES.length);
  });

  it("is not indexable", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("names each language in that language, not as a translation of the other", () => {
    expect(getDictionary("ko").notFound.home).toMatch(/[가-힣]/);
    expect(getDictionary("en").notFound.home).not.toMatch(/[가-힣]/);
  });

  it("depends on nothing request-specific", async () => {
    // Rendering twice must produce identical markup: the 404 reads no pathname,
    // no headers and no per-request store. See docs/ARCHITECTURE.md.
    expect(renderToStaticMarkup(<GlobalNotFound />)).toBe(html);
    await expect(
      import("@/lib/request-locale" as string).then(() => "exists"),
    ).rejects.toThrow();
  });
});
