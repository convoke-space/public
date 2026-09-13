import { describe, expect, it } from "vitest";
import { LOCALES, siteConfig } from "../site.config";
import { entryAlternates, languageTargets, sharedPage } from "@/lib/alternates";
import { getEntry, getProjects } from "@/lib/content";
import { getDictionary, isLocale, otherLocales } from "@/lib/i18n";
import { navItems, footerSections, SECTION_PATH } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";
import { canonicalUrl, encodePath, localePath } from "@/lib/site";

describe("locale guard", () => {
  it.each([
    ["ko", true],
    ["en", true],
    ["fr", false],
    ["KO", false],
    ["", false],
    [undefined, false],
  ])("isLocale(%s) -> %s", (value, expected) => {
    expect(isLocale(value)).toBe(expected);
  });

  it("knows the other locales", () => {
    expect(otherLocales("ko")).toEqual(["en"]);
    expect(otherLocales("en")).toEqual(["ko"]);
  });
});

describe("locale paths", () => {
  it("prefixes every path with its locale", () => {
    expect(localePath("ko", "/writing")).toBe("/ko/writing");
    expect(localePath("en", "writing")).toBe("/en/writing");
    expect(localePath("ko", "/")).toBe("/ko");
  });

  it("percent-encodes Hangul segments for absolute URLs", () => {
    const encoded = encodePath("/ko/writing/깃허브를-공용기억으로");
    expect(encoded).toBe("/ko/writing/%EA%B9%83%ED%97%88%EB%B8%8C%EB%A5%BC-%EA%B3%B5%EC%9A%A9%EA%B8%B0%EC%96%B5%EC%9C%BC%EB%A1%9C");
    expect(canonicalUrl("/ko/writing/깃허브를-공용기억으로")).toBe(
      `${siteConfig.canonicalOrigin}${encoded}`,
    );
  });

  it("is idempotent on an already-encoded path", () => {
    const once = encodePath("/ko/writing/한글");
    expect(encodePath(once)).toBe(once);
  });
});

describe("navigation stays inside its locale", () => {
  it("builds every nav and footer link under the current locale", () => {
    for (const locale of LOCALES) {
      for (const item of [...navItems(locale), ...footerSections(locale)]) {
        expect(localePath(locale, item.path).startsWith(`/${locale}/`)).toBe(true);
      }
    }
  });

  it("labels navigation in the current language", () => {
    expect(navItems("ko").map((i) => i.label)).toContain("소개");
    expect(navItems("en").map((i) => i.label)).toContain("About");
  });

  it("only advertises a section that has content in that locale", () => {
    for (const locale of LOCALES) {
      for (const item of navItems(locale)) {
        const collection = Object.entries(SECTION_PATH).find(
          ([, path]) => path === item.path,
        )?.[0];
        if (!collection) continue; // /about has no collection
        expect(item.path).toBe(SECTION_PATH[collection as keyof typeof SECTION_PATH]);
      }
    }
  });
});

describe("language switch targets", () => {
  it("maps a section to the same section in the other language", () => {
    const targets = languageTargets(sharedPage("/writing"));
    expect(targets).toEqual([
      { locale: "ko", href: "/ko/writing" },
      { locale: "en", href: "/en/writing" },
    ]);
  });

  it("maps an entry to its counterpart, across differing slugs", () => {
    const project = getProjects("ko")[0];
    if (!project) return; // no published projects: nothing to assert
    const targets = languageTargets(entryAlternates(project));
    const en = targets.find((t) => t.locale === "en");
    const counterpart = getEntry("projects", "en", "convoke-space");
    expect(en?.href).toBe(`/en/projects/${counterpart?.slug}`);
  });

  it("offers no href when the other edition does not exist", () => {
    const targets = languageTargets({ ko: "/writing/한글만" });
    expect(targets.find((t) => t.locale === "en")?.href).toBeNull();
  });
});

describe("page metadata", () => {
  it("uses a localized canonical URL", () => {
    const meta = pageMetadata({ locale: "ko", path: "/writing" });
    expect(meta.alternates?.canonical).toBe(
      `${siteConfig.canonicalOrigin}/ko/writing`,
    );
  });

  it("emits hreflang for both editions when both exist", () => {
    const meta = pageMetadata({
      locale: "ko",
      path: "/writing",
      alternates: sharedPage("/writing"),
    });
    expect(meta.alternates?.languages).toEqual({
      ko: `${siteConfig.canonicalOrigin}/ko/writing`,
      en: `${siteConfig.canonicalOrigin}/en/writing`,
    });
  });

  it("emits hreflang only for editions that exist", () => {
    const meta = pageMetadata({
      locale: "ko",
      path: "/writing/번역-대기중",
      alternates: { ko: "/writing/번역-대기중" },
    });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toEqual(["ko"]);
    expect(languages.en).toBeUndefined();
  });

  it("adds x-default only where the gateway is the neutral entry point", () => {
    const home = pageMetadata({
      locale: "ko",
      path: "/",
      alternates: sharedPage("/"),
      includeXDefault: true,
    });
    expect(
      (home.alternates?.languages as Record<string, string>)["x-default"],
    ).toBe(`${siteConfig.canonicalOrigin}/`);

    const article = pageMetadata({
      locale: "ko",
      path: "/writing/x",
      alternates: { ko: "/writing/x" },
    });
    expect(
      (article.alternates?.languages as Record<string, string>)["x-default"],
    ).toBeUndefined();
  });

  it("uses the locale's Open Graph code and names the alternate", () => {
    const meta = pageMetadata({
      locale: "ko",
      path: "/writing",
      alternates: sharedPage("/writing"),
    });
    expect(meta.openGraph?.locale).toBe("ko_KR");
    expect(
      (meta.openGraph as { alternateLocale?: string[] }).alternateLocale,
    ).toEqual(["en_US"]);
  });

  it("names no alternate locale when only one edition exists", () => {
    const meta = pageMetadata({
      locale: "ko",
      path: "/writing/x",
      alternates: { ko: "/writing/x" },
    });
    expect(
      (meta.openGraph as { alternateLocale?: string[] }).alternateLocale,
    ).toBeUndefined();
  });

  it("asserts no author, because Convoke has no published author identity", () => {
    const meta = pageMetadata({
      locale: "en",
      path: "/writing/x",
      type: "article",
      publishedTime: "2026-01-01",
    });
    expect((meta.openGraph as { authors?: unknown }).authors).toBeUndefined();
  });

  it("points each locale's feed at that locale", () => {
    for (const locale of LOCALES) {
      const meta = pageMetadata({ locale, path: "/" });
      const feeds = meta.alternates?.types?.["application/rss+xml"] as {
        url: string;
        title: string;
      }[];
      expect(feeds[0]?.url).toBe(
        `${siteConfig.canonicalOrigin}/${locale}/feed.xml`,
      );
      expect(feeds[0]?.title).toBe(getDictionary(locale).feed.title);
    }
  });
});
