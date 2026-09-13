import type { MetadataRoute } from "next";
import { LOCALES, siteConfig, type Locale } from "../../site.config";
import {
  getEvents,
  getPosts,
  getProjects,
  lastModified,
  published,
  type Entry,
} from "@/lib/content";
import { entryAlternates, sharedPage } from "@/lib/alternates";
import { canonicalUrl, localePath } from "@/lib/site";
import type { LocaleAlternates } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * One sitemap covering both languages.
 *
 * Every URL is a localized canonical, and each carries `alternates.languages`
 * for the editions that actually exist — never for one that does not. `/` is
 * the x-default entry point.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const everything = LOCALES.flatMap((locale) => [
    ...getPosts(locale),
    ...getProjects(locale),
    ...getEvents(locale),
  ]);

  entries.push({
    url: canonicalUrl("/"),
    lastModified: newest(everything),
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        ...languageMap(sharedPage("/")),
        "x-default": canonicalUrl("/"),
      },
    },
  });

  for (const locale of LOCALES) {
    entries.push({
      url: canonicalUrl(localePath(locale, "/")),
      lastModified: newest(
        everything.filter((entry) => entry.locale === locale),
      ),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: languageMap(sharedPage("/")) },
    });

    entries.push({
      url: canonicalUrl(localePath(locale, "/about")),
      changeFrequency: "yearly",
      priority: 0.5,
      alternates: { languages: languageMap(sharedPage("/about")) },
    });

    addSection(entries, locale, "/writing", "posts", getPosts(locale), 0.8, 0.7);
    addSection(
      entries,
      locale,
      "/projects",
      "projects",
      getProjects(locale),
      0.8,
      0.6,
    );
    addSection(
      entries,
      locale,
      "/gatherings",
      "events",
      getEvents(locale),
      0.7,
      0.6,
    );
  }

  return entries;
}

function addSection(
  entries: MetadataRoute.Sitemap,
  locale: Locale,
  path: string,
  collection: "posts" | "projects" | "events",
  items: Entry[],
  sectionPriority: number,
  itemPriority: number,
) {
  if (items.length === 0) return;

  // A section is only offered in the languages that actually have content.
  const sectionAlternates = Object.fromEntries(
    LOCALES.filter((l) => published(collection, l).length > 0).map((l) => [
      l,
      path,
    ]),
  ) as LocaleAlternates;

  entries.push({
    url: canonicalUrl(localePath(locale, path)),
    lastModified: newest(items),
    changeFrequency: "weekly",
    priority: sectionPriority,
    alternates: { languages: languageMap(sectionAlternates) },
  });

  for (const item of items) {
    entries.push({
      url: canonicalUrl(localePath(locale, `${path}/${item.slug}`)),
      lastModified: lastModified(item),
      changeFrequency: "monthly",
      priority: itemPriority,
      alternates: { languages: languageMap(entryAlternates(item)) },
    });
  }
}

function languageMap(alternates: LocaleAlternates): Record<string, string> {
  return Object.fromEntries(
    (Object.entries(alternates) as [Locale, string][]).map(
      ([locale, path]) => [
        siteConfig.htmlLang[locale],
        canonicalUrl(localePath(locale, path)),
      ],
    ),
  );
}

function newest(items: Entry[]): Date {
  if (items.length === 0) return new Date(0);
  return new Date(
    Math.max(...items.map((item) => lastModified(item).getTime())),
  );
}
