import { describe, expect, it } from "vitest";
import { LOCALES, siteConfig } from "../site.config";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as feed } from "@/app/[locale]/feed.xml/route";
import { getPosts, getProjects } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { canonicalUrl, localePath } from "@/lib/site";

const origin = siteConfig.canonicalOrigin;

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("includes the gateway with an x-default alternate", () => {
    const root = entries.find((e) => e.url === `${origin}/`);
    expect(root).toBeDefined();
    expect(root?.alternates?.languages).toMatchObject({
      ko: `${origin}/ko`,
      en: `${origin}/en`,
      "x-default": `${origin}/`,
    });
  });

  it("includes both locale homes and About pages", () => {
    for (const locale of LOCALES) {
      expect(urls).toContain(`${origin}/${locale}`);
      expect(urls).toContain(`${origin}/${locale}/about`);
    }
  });

  it("lists every published entry under its own locale", () => {
    for (const locale of LOCALES) {
      for (const project of getProjects(locale)) {
        expect(urls).toContain(
          canonicalUrl(localePath(locale, `/projects/${project.slug}`)),
        );
      }
      for (const post of getPosts(locale)) {
        expect(urls).toContain(
          canonicalUrl(localePath(locale, `/writing/${post.slug}`)),
        );
      }
    }
  });

  it("gives every alternate target a URL that is itself in the sitemap", () => {
    const known = new Set(urls);
    for (const entry of entries) {
      for (const [tag, url] of Object.entries(
        entry.alternates?.languages ?? {},
      )) {
        expect(typeof url).toBe("string");
        expect(known.has(url as string), `${tag} -> ${url} is not a sitemap URL`).toBe(
          true,
        );
      }
    }
  });

  it("never advertises a section in a locale that has no content", () => {
    for (const locale of LOCALES) {
      const hasPosts = getPosts(locale).length > 0;
      expect(urls.includes(`${origin}/${locale}/writing`)).toBe(hasPosts);
    }
  });

  it("emits no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("percent-encodes non-ASCII slugs", () => {
    for (const url of urls) {
      expect(url).not.toMatch(/[^ -~]/);
    }
  });
});

describe("robots", () => {
  it("allows crawling and names the sitemap in production", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${origin}/sitemap.xml`);
    expect(result.rules).toEqual([{ userAgent: "*", allow: "/" }]);
  });
});

describe("per-locale feeds", () => {
  async function read(locale: string) {
    const response = await feed(new Request(`${origin}/${locale}/feed.xml`), {
      params: Promise.resolve({ locale }),
    });
    return { response, xml: await response.text() };
  }

  it("serves one feed per locale, in that language", async () => {
    for (const locale of LOCALES) {
      const { response, xml } = await read(locale);
      const dict = getDictionary(locale);
      expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
      expect(xml).toContain(`<language>${siteConfig.htmlLang[locale]}</language>`);
      expect(xml).toContain(`<title>${dict.feed.title}</title>`);
      expect(xml).toContain(`${origin}/${locale}/feed.xml`);
    }
  });

  it("carries only that locale's items", async () => {
    for (const locale of LOCALES) {
      const { xml } = await read(locale);
      const otherLocale = locale === "ko" ? "en" : "ko";
      for (const post of getPosts(locale)) {
        expect(xml).toContain(
          canonicalUrl(localePath(locale, `/writing/${post.slug}`)),
        );
      }
      for (const post of getPosts(otherLocale)) {
        expect(xml).not.toContain(
          canonicalUrl(localePath(otherLocale, `/writing/${post.slug}`)),
        );
      }
    }
  });

  it("is well-formed even with no items", async () => {
    const { xml } = await read("ko");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.trimEnd().endsWith("</rss>")).toBe(true);
  });
});
